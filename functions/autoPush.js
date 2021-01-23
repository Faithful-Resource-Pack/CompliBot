// original link : https://dev.to/lucis/how-to-push-files-programatically-to-a-repository-using-octokit-with-typescript-1nj0
// (typescript)

const { Octokit }  = require('@octokit/rest');
const glob         = require('globby');
const path         = require('path');
const { readFile } = require('fs-extra');

async function autoPush(ORGANIZATION, REPO, BRANCH, COMMITMESSAGE, LOCAL) {
	
	// Authentification trough CompliBot GitHub Account
	const octo = new Octokit({
		auth: process.env.COMPLIBOT_GIT_TOKEN,
	})

	const repos = await octo.repos.listForOrg({
		org: ORGANIZATION,
	})

	// Upload files to repo:
	await uploadToRepo(octo, LOCAL, ORGANIZATION, REPO, BRANCH, COMMITMESSAGE);
}

/*
 * UPLOADING FILES:
*/
const uploadToRepo = async (octo, coursePath, org, repo, branch, commitMessage) => {
	const currentCommit = await getCurrentCommit(octo, org, repo, branch)
	const filesPaths = await glob(coursePath)
	const filesBlobs = await Promise.all(filesPaths.map(createBlobForFile(octo, org, repo)))
	const pathsForBlobs = filesPaths.map(fullPath => path.relative(coursePath, fullPath))
	const newTree = await createNewTree(octo,	org, repo, filesBlobs, pathsForBlobs,	currentCommit.treeSha)
	const newCommit = await createNewCommit(
		octo,
		org,
		repo,
		commitMessage,
		newTree.sha,
		currentCommit.commitSha
	)
	await setBranchToCommit(octo, org, repo, branch, newCommit.sha)
}

/*
 * GET CURRENT COMMIT
 * -> used to make a new commit
*/
const getCurrentCommit = async (octo, org, repo, branch) => {
	const { data: refData } = await octo.git.getRef({
		owner: org,
		repo,
		ref: `heads/${branch}`,
	})
	const commitSha = refData.object.sha
	const { data: commitData } = await octo.git.getCommit({
		owner: org,
		repo,
		commit_sha: commitSha,
	})
	return {
		commitSha,
		treeSha: commitData.tree.sha,
	}
}

// Notice that readFile's utf8 is typed differently from Github's utf-8
const getFileAsUTF8 = (filePath) => readFile(filePath, {encoding: 'utf8'})

// Get file as binary file (used for .png files)
const getFileAsBinary = (filePath) => readFile(filePath, {encoding: 'base64'})

const createBlobForFile = (octo, org, repo) => async (filePath) => {
	var content = undefined;
	var blobData = undefined;

	if (filePath.endsWith('.png')) {
		content = await getFileAsBinary(filePath)
		blobData = await octo.git.createBlob({
			owner: org,
			repo,
			content,
			encoding: 'base64',
		});
	}
	else {
		content = await getFileAsUTF8(filePath)
		blobData = await octo.git.createBlob({
			owner: org,
			repo,
			content,
			encoding: 'utf-8',
		});
	}
  return blobData.data
}
//const newTree = await createNewTree(octo,	org, repo, filesBlobs, pathsForBlobs,	currentCommit.treeSha)
const createNewTree = async (octo, owner, repo, blobs = Octokit.GitCreateBlobResponse, paths, parentTreeSha) => {
  const tree = blobs.map(({ sha }, index) => ({
    path: paths[index],
    mode: `100644`,
    type: `blob`,
    sha,
  })) //as Octokit.GitCreateTreeParamsTree()
  const { data } = await octo.git.createTree({
    owner,
    repo,
    tree,
    base_tree: parentTreeSha,
  })

  return data
}

const createNewCommit = async (
  octo,
  org,
  repo,
  message,
  currentTreeSha,
  currentCommitSha
) =>
  (await octo.git.createCommit({
    owner: org,
    repo,
    message,
    tree: currentTreeSha,
    parents: [currentCommitSha],
  })).data

const setBranchToCommit = (
  octo,
  org,
  repo,
  branch,
  commitSha
) =>
  octo.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
  })

exports.autoPush = autoPush;
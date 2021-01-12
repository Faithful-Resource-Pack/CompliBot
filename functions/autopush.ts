// I haven't tested this code yet
// original link : https://dev.to/lucis/how-to-push-files-programatically-to-a-repository-using-octokit-with-typescript-1nj0
// (typescript)

import Octokit from '@octokit/rest'
import glob from 'globby' 
import path from 'path'
import { readFile } from 'fs-extra'

const main = async () => {
	
	// Authentification trough CompliBot GitHub Account
	const octo = new Octokit({
		auth: process.env.COMPLIBOT_GIT_TOKEN,
	})
	
	// Settings:
	const ORGANIZATION = `Compliance-Resource-Pack`;
	const REPO = `Compliance-Java-32x`;
	const repos = await octo.repos.listForOrg({
		org: ORGANIZATION,
	})

	// Create repo if not found
	if (!repos.data.map((repo: Octokit.ReposListForOrgResponseItem) => repo.name).includes(REPO)) {
		await createRepo(octo, ORGANIZATION, REPO);
		console.log(`No repository found, creating one!`);
	}

	// Upload files to repo:
	await uploadToRepo(octo, `./this-is-a-local-folder-from-replit`, ORGANIZATION, REPO);
}

main();

/*
 * CREATING REPOSITORY:
*/
const createRepo = async (octo: Octokit, org: string, name: string) => {
	await octo.repos.createInOrg({ org, name, auto_init:true });
}

/*
 * UPLOADING FILES:
*/
const uploadToRepo = async (
	octo: Octokit,
	coursePath: string,
	org: string,
	repo: string,
	branch: string = `master` // should be adapted
) => {
	const currentCommit = await getCurrentCommit(octo, org, repo, branch)
	const filesPath = await glob(coursePath)
	const filesBlobs = await Promise.all(filesPaths.map(createBlobForFile(octo, org, repo)))
	const pathsForBlobs = filesPaths.map(fullPath => path.relative(coursePath, fullPath))
	const newTree = await createNewTree(
		octo,
		org,
		repo,
		filesBlobs,
		pathsForBlobs,
		currentCommit.treeSha
	)
	const commitMessage = `My commit message` // should be adapted
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
const getCurrentCommit = async (
	octo: Octokit,
	org: string,
	repo: string,
	branch: string = 'master' // should be adapted
) => {
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
const getFileAsUTF8 = (filePath: string) => readFile(filePath, 'utf8')

const createBlobForFile = (octo: Octokit, org: string, repo: string) => async (
  filePath: string
) => {
  const content = await getFileAsUTF8(filePath)
  const blobData = await octo.git.createBlob({
    owner: org,
    repo,
    content,
    encoding: 'utf-8',
  })
  return blobData.data
}

const createNewTree = async (
  octo: Octokit,
  owner: string,
  repo: string,
  blobs: Octokit.GitCreateBlobResponse[],
  paths: string[],
  parentTreeSha: string
) => {
  const tree = blobs.map(({ sha }, index) => ({
    path: paths[index],
    mode: `100644`,
    type: `blob`,
    sha,
  })) as Octokit.GitCreateTreeParamsTree[]
  const { data } = await octo.git.createTree({
    owner,
    repo,
    tree,
    base_tree: parentTreeSha,
  })
  return data
}

const createNewCommit = async (
  octo: Octokit,
  org: string,
  repo: string,
  message: string,
  currentTreeSha: string,
  currentCommitSha: string
) =>
  (await octo.git.createCommit({
    owner: org,
    repo,
    message,
    tree: currentTreeSha,
    parents: [currentCommitSha],
  })).data

const setBranchToCommit = (
  octo: Octokit,
  org: string,
  repo: string,
  branch: string = `master`,
  commitSha: string
) =>
  octo.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
  })
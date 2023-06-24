/*eslint-env node*/

/**
 * ORIGINAL LINK: (Typescript)
 * https://dev.to/lucis/how-to-push-files-programatically-to-a-repository-using-octokit-with-typescript-1nj0
 *
 */

const glob = require("globby");
const { normalize, relative } = require("path");

const { Octokit } = require("@octokit/rest");
const { readFile } = require("fs-extra");

/**
 * Automated push through GitHub
 * @param {String} org GitHub organization name
 * @param {String} repo Github repository name
 * @param {String} branch branch name
 * @param {String} commitMessage
 * @param {String} localPath
 */
module.exports = async function pushToGitHub(org, repo, branch, commitMessage, localPath) {
	// Authentification through CompliBot GitHub Account
	const octo = new Octokit({
		auth: process.env.COMPLIBOT_GIT_TOKEN,
	});

	// Upload files to repo:
	await uploadToRepo(octo, localPath, org, repo, branch, commitMessage);
};

/**
 * Upload files to repository
 * @param {Octokit} octo
 * @param {String} coursePath path from where file are uploaded
 * @param {String} org GitHub organisation
 * @param {String} repo GitHub repository of the organisation
 * @param {String} branch GitHub branch of the repository
 * @param {String} commitMessage Message of commit
 */
const uploadToRepo = async (octo, coursePath, org, repo, branch, commitMessage) => {
	const currentCommit = await getCurrentCommit(octo, org, repo, branch);
	const filesPaths = await glob(coursePath);
	if (!filesPaths) return;
	const filesBlobs = await Promise.all(filesPaths.map(createBlobForFile(octo, org, repo))); // suspected problem on createBlobForFile which fails and give undefined
	const pathsForBlobs = filesPaths.map((fullPath) =>
		normalize(relative(coursePath, fullPath)).replace(/\\/g, "/"),
	);
	const newTree = await createNewTree(
		octo,
		org,
		repo,
		filesBlobs,
		pathsForBlobs,
		currentCommit.treeSha,
	);
	const newCommit = await createNewCommit(
		octo,
		org,
		repo,
		commitMessage,
		newTree.sha,
		currentCommit.commitSha,
	);
	await setBranchToCommit(octo, org, repo, branch, newCommit.sha);
};

/**
 * Get current commit of a branch from a repository
 * @param {Octokit} octo
 * @param {String} org GitHub organisation
 * @param {String} repo GitHub repository of the organisation
 * @param {String} branch GitHub branch of the repository
 * @returns
 */
const getCurrentCommit = async (octo, org, repo, branch) => {
	const { data: refData } = await octo.git.getRef({
		owner: org,
		repo,
		ref: `heads/${branch}`,
	});
	const commitSha = refData.object.sha;
	const { data: commitData } = await octo.git.getCommit({
		owner: org,
		repo,
		commit_sha: commitSha,
	});
	return {
		commitSha,
		treeSha: commitData.tree.sha,
	};
};

/**
 * Get file as utf8 file
 * Notice that readFile's UTF8 is typed differently from Github's UTF-8
 * @param {String} filePath
 * @returns an utf8 file
 */
const getFileAsUTF8 = (filePath) => readFile(filePath, { encoding: "utf8" });

/**
 * Get file as binary file (used for .png files)
 * @param {String} filePath
 * @returns a base64 file
 */
const getFileAsBinary = (filePath) => readFile(filePath, { encoding: "base64" });

/**
 * Create blob for a file
 * @param {Octokit} octo
 * @param {String} org Github organisation
 * @param {String} repo Github repository of the organisation
 * @returns data of the blob
 */
const createBlobForFile = (octo, org, repo) => async (filePath) => {
	let content;
	let blobData;

	if (filePath.endsWith(".png")) {
		content = await getFileAsBinary(filePath);
		blobData = await octo.git.createBlob({
			owner: org,
			repo,
			content,
			encoding: "base64",
		});
	} else {
		content = await getFileAsUTF8(filePath);
		blobData = await octo.git
			.createBlob({
				owner: org,
				repo,
				content,
				encoding: "utf-8",
			})
			.catch((err) => {
				console.error(err);
				return Promise.reject(err);
			});
	}

	return blobData.data;
};

/**
 * @param {Octokit} octo
 * @param {String} owner GitHub organisation
 * @param {String} repo GitHub repository of the organisation
 * @param {Blob} blobs
 * @param {*} paths
 * @param {*} parentTreeSha
 * @returns data : {owner, repo, tree, base_tree: parentTreeSha }
 */
const createNewTree = async (
	octo,
	owner,
	repo,
	blobs = Octokit.GitCreateBlobResponse,
	paths,
	parentTreeSha,
) => {
	const tree = blobs.map(({ sha }, index) => ({
		path: paths[index],
		mode: `100644`,
		type: `blob`,
		sha: sha,
	})); //as Octokit.GitCreateTreeParamsTree()
	const { data } = await octo.git.createTree({
		owner: owner,
		repo: repo,
		tree: tree,
		base_tree: parentTreeSha,
	});

	return data;
};

/**
 * Create a new commit
 * @param {Octokit} octo
 * @param {String} org GitHub organisation
 * @param {String} repo GitHub repository of the organisation
 * @param {String} message Commit message
 * @param {*} currentTreeSha
 * @param {*} currentCommitSha
 */
const createNewCommit = async (octo, org, repo, message, currentTreeSha, currentCommitSha) =>
	(
		await octo.git.createCommit({
			owner: org,
			repo,
			message,
			tree: currentTreeSha,
			parents: [currentCommitSha],
		})
	).data;

/**
 * Set branch to commit
 * @param {Octokit} octo
 * @param {String} org GitHub organisation
 * @param {String} repo GitHub repository of the organisation
 * @param {String} branch GitHub branch of the repository
 * @param {*} commitSha
 * @returns
 */
const setBranchToCommit = (octo, org, repo, branch, commitSha) =>
	octo.git.updateRef({
		owner: org,
		repo,
		ref: `heads/${branch}`,
		sha: commitSha,
	});

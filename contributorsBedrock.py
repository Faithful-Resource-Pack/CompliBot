import os
import json

path = ''
data = []

folders = ['textures']

for folder in folders:
	for root, directories, files in os.walk(path + '\\' + folder):
		for filename in files:
			relative_path = root.replace(path + '\\', '').replace('\\', '/')
			if filename.endswith('.png'):
				custom = {}
				custom["path"] = relative_path+'/'+filename
				custom["c32"] = {}
				custom["c64"] = {}
				data.append(custom)

with open('contributorsBedrock.json', 'w') as outfile:
	json.dump(data, outfile, indent=2, sort_keys=True)
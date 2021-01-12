import os
import json

path = ''
data = []

folders = ['realms', 'minecraft']

for folder in folders:
	for root, directories, files in os.walk(path + '\\' + folder):
		for filename in files:
			relative_path = root.replace(path + '\\', '').replace('\\', '/')
			if filename.endswith('.png'):
				data.append(relative_path+'/'+filename)

with open('textures.json', 'w') as outfile:
	json.dump(data, outfile, indent=2, sort_keys=True)
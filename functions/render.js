/*
 * A huge thanks to CodyJasonBennett who help us!
*/

//const puppeteer = require('puppeteer');
const Discord   = require('discord.js');

const renderBlock = async block => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--use-gl', '--use-cmd-decoder=passthrough'],
  });
  const page = await browser.newPage();

  await page.goto(`file://${__dirname}/index.html?block=${block.toLowerCase()}`);
  await page.waitForSelector('canvas');

  const image = await page.evaluate(() => document.querySelector('canvas').toDataURL());

  await browser.close();

  return image;
};

async function render(message, type, textures) {
	if (type == 'full-block') {
		const image = await renderBlock('stone');
		if (!image) return warnUser(message, 'Block: not found');

		const imageStream = new Buffer.from(image.split(',')[1], 'base64');
		const attachment  = new Discord.MessageAttachment(imageStream, 'output.png');

		return message.channel.send(attachment);
	}
}
/*
const bot = new discord.Client();
bot.login(process.env.TOKEN);

bot.on('message', async msg => {
  if (!msg.content.startsWith('!block ')) return;

  const block = msg.content.replace('!block', '').trim();

  const image = await renderBlock(block);
  if (!image) return msg.channel.send(`Block: ${block} not found.`);

  const imageStream = new Buffer.from(image.split(',')[1], 'base64');
  const attachment = new discord.MessageAttachment(imageStream, 'output.png');

  return msg.channel.send(attachment);
});



/*
var mesh, camera, scene, renderer, teximage;

var window = {innerWidth: 800, innerHeight: 600};

var loadTextureHTTP = function (url, callback) {
	require('request')({
		method: 'GET', url: url, encoding: null
	},
	function (error, response, body) {
		if (error) throw error;
		console.log('body:', body.length);

		var image = new Canvas.Image;
		image.src = body;

		var texture = new THREE.Texture(image);
		texture.needsUpdate = true;

		teximage = image;
		if (callback) callback(texture);
	});
}

function init(type, textures) {
	// GL Scene renderer
	var canvasGL = new Canvas.createCanvas(window.innerWidth, window.innerHeight);
	canvasGL.addEventListener = function(event, func, bind_) {}; //mock function to avoid WebGL errors
	renderer = new THREE.WebGLRenderer({
		context: glContext,
		antialias: true,
		canvas: canvasGL
	});

	camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 1, 1000);
	camera.position.set(1,1,1);
	camera.aspect = window.innnerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	scene = new THREE.Scene()

	// Cube renderer
	var canvasCube = new Canvas.createCanvas(2048, 2048);
	if (type == 'full-block') {
		var map      = THREE.ImageUtils.loadTexture(textures[0]);
		var material = new THREE.MeshLambertMaterial({map: map});
		var geom     = new THREE.CubeGeometry(200,200,200);
		var mesh     = new THREE.Mesh(geom, material);

		mesh.rotation.x = 0.1;
		mesh.rotation.y = 0.5;
		mesh.rotation.z = 0.5;

		scene.add(mesh);
	}

	scene.add( new THREE.HemisphereLight( 0x443333, 0x222233, 4 ) );
}

function render() {
	var canv = renderer.render(camera, scene);
	canv.getContext('2d').drawImage(teximage, 0, 0, 1024, 512);
}

async function renderAndExport(exportPath) {
	console.log('rendering...');
	await render();
	console.log('exporting...');
	await exportImage(exportPath)
	console.log('done!');
}

function render(type, textures) {
	init(type, textures);
	renderAndExport('./render/out.png');
}


/*
var self = self || {}; // File:src/Three.js

const canvasWidth = 1024;
const canvasHeight = 1024;

global.window = {
	innerWidth: canvasWidth,
	innerHeight: canvasHeight
};

global.document = {
	createElement: function(name) {
		if (name == "canvas") {
			//return new Canvas(canvasWidth, canvasHeight);
		}
		var Canvas = require('canvas');
		return new Canvas.createCanvas(canvasWidth, canvasHeight);
	},
	createElementNS: function(name) {
		var Canvas = require('canvas');
		return new Canvas.createCanvas(canvasWidth, canvasHeight);
	}
};

class ThreeClient extends EventEmitter {
	constructor() {
		super();
		var self = this;
		this.appId = 667;

		self.loaded = false

		this.bgColor     = '#282c34';
		this.textColor   = '#fff';
		this.tildeColor  = '#0000ff';
		this.selectColor = '#ffffff';

		this.width  = canvasWidth;
		this.height = canvasHeight;

		this.renderer = new THREE.CanvasRenderer();
		this.renderer.setSize = (this.width, this.height);

		this.camera = new THREE.PerspectiveCamera(75, this.width/this.height, 0.001, 3000);
		this.camera.position.z = 2;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xECF8FF);
		this.scene.add(new THREE.HemisphereLight(0x606060, 0x404040));
		this.light = new THREE.DirectionalLight(0xffffff);
		this.light.position.set(1,1,1,1).normalize();
		this.scene.add(this.light);

		this.updated = false;
	}

	getTexture() {
		this.renderer.render(this.scene, this.camera);
		var data = this.renderer.domElement.toDataURL().substr("data:image/png;base64".length);
		var buf  = new Buffer(data, 'base64');
		fs.writeFile('image.png', buf);
	}
}

var THREEClient = new ThreeClient();

function render(type, textures){
	var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(canvasWidth, canvasHeight);

	var camera = new THREE.PerspectiveCamera(75, canvasWidth/canvasHeight, 1, 3000);
	camera.position.z = 500;

	var scene = new THREE.Scene();
	scene.add(camera);

	if (type = 'full-block') {
		var map      = THREE.ImageUtils.loadTexture(textures[0]);
		var material = new THREE.MeshLambertMaterial({map: map});
		var geom     = new THREE.CubeGeometry(200,200,200);
		var mesh     = new THREE.Mesh(geom, material);

		mesh.rotation.x = 0.1;
		mesh.rotation.y = 0.5;
		mesh.rotation.z = 0.5;

		scene.add(mesh);
	}

	renderer.render(scene, camera);

	renderer.domElement.toBuffer(function(err, buf) {
		fs.writeFile('./out.png', buf, function(err) {
			if (err) throw err;
			console.log('Done!');
		})
	});
}
*/
exports.render = render;
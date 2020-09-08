/* Frog Jumper
   - JS13K Game Entry 2020
   - 404 Challenge... Dude where's my semi colons 
   - (c) Rob Murrer with many thanks to...
		   - frog.gif  ...
		   - chicken.png from opengameart.org
		   - kontra.js - Lambert
   - o/
*/

import {init, initKeys, SpriteSheet, Sprite, randInt, GameLoop, keyPressed} from 'kontra'

const GAME_SIZE = 512
const FROG_SIZE = 16 

interface KeyDelta
{
	old: boolean,
	new: boolean,
}

interface FGState {
	p1wins: boolean;
	p1key_up: KeyDelta,
	p1key_down: KeyDelta,
	p1key_left: KeyDelta,
	p1key_right: KeyDelta,
	p1key_attack: KeyDelta,

}

let state : FGState = {
	p1wins: false,
	p1key_up: {old: false, new: false}, 
	p1key_down: {old: false, new: false},
	p1key_left: {old: false, new: false},
	p1key_right: {old: false, new: false},
	p1key_attack: {old: false, new: false},
};

//must do this first!!!
let { canvas } = init()
initKeys()

let frogo = new Image()
frogo.src = 't.png'
frogo.onload = function() {
	let frogo_sheet = SpriteSheet({
		image: frogo,
		frameWidth: FROG_SIZE,
		frameHeight: FROG_SIZE,
		animations: {
			stay: {
				frames: 1,
			}, 
			jump: {
				frames: '0..1',
				frameRate: 10, 
			},
			turbo: {
				frames: '0..1',
				frameRate: 10, 
			}
		}
	})

	let chicko_sheet = SpriteSheet({
		image: frogo, 
		frameWidth: FROG_SIZE*4,
		frameHeight: FROG_SIZE*4,
		animations: {
			stay:
			{
				frames:0,
			},
			walk:
			{
				frames: '1..2',
				frameRate: 10,
			}
		}
	})

	let p1 = Sprite({
		x:GAME_SIZE/2,
		y:GAME_SIZE/2,
		dy:2,
		animations: chicko_sheet.animations,
	})

	
	let sprites = []
	for (let i=0; i<10; i++)
	{
		let sprite = Sprite({
			x:(i+FROG_SIZE*i*i)%GAME_SIZE,
			y: randInt(0, FROG_SIZE*FROG_SIZE),
			dx: randInt(0,1)*-1 + (randInt(0, FROG_SIZE)*.1),
			dy: randInt(0,1)*-1 + (randInt(0, FROG_SIZE)*.1),
			animations: frogo_sheet.animations
		})
		sprites.push(sprite)
	}

	let loop = GameLoop({
		update: function() {
			state.p1key_up.old = state.p1key_up.new
			state.p1key_left.old = state.p1key_left.new
			state.p1key_down.old = state.p1key_down.new
			state.p1key_right.old = state.p1key_right.new
			state.p1key_attack.old = state.p1key_attack.new

			state.p1key_up.new= keyPressed('w') || keyPressed('up')
			state.p1key_left.new = keyPressed('a') || keyPressed('left')
			state.p1key_down.new = keyPressed('s') || keyPressed('down')
			state.p1key_right.new = keyPressed('d') || keyPressed('right')
			state.p1key_attack.new = keyPressed('space')

			const swp = 3.14/1.0
			
			sprites.map(s => function () {
				if (s.y > GAME_SIZE - FROG_SIZE|| s.y - FROG_SIZE < 0) {
					s.dy = -s.dy
				} 

				if (s.x > GAME_SIZE - FROG_SIZE || s.x - FROG_SIZE < 0) {
					s.dx = -s.dx
				}

				s.playAnimation(randInt(0,10) === 1 ? 'stay' : 'turbo')
				s.update()

			}())//gotta execute it w. the () at the end of function {}() :D

			var arr = [],
			volume = 0.01,
			seconds = 1,
			tone = 111 

			for (var i = 0; i < context.sampleRate * seconds; i++) {
				arr[i] = sineWaveAt(i, tone) * volume
			}

			var bock = [],
			volume = 0.03,
			seconds = .1,
			tone = 333

			for (var i = 0; i < context.sampleRate * seconds; i++) {
				bock[i] = sineWaveAt(i, tone) * volume 
			}

			let moving = true
			let jumping = false
			if (state.p1key_attack.new) {
				p1.x = p1.x + swp*swp;
				//p1.playAnimation('turbo')
				playSound(bock)
			}

			if (state.p1key_up.new) {
				//sprite.dy = -swp;
				p1.y = p1.y - swp*swp
				p1.dy = 2 
				//p1.playAnimation('jump')
				playSound(arr)
			}

			if (state.p1key_down.new) {
				//sprite.dy = swp;
				p1.y = p1.y + swp
				//sprite.playAnimation('jump')
				playSound(arr)
			}
			if (state.p1key_left.new) {
				//sprite.dx = -swp;
				p1.x = p1.x - swp
				//p1.playAnimation('jump')
				playSound(arr)
			}

			if (state.p1key_right.new) {
				//sprite.dx = swp;
				p1.x = p1.x + swp
				//sprite.playAnimation('jump')
				playSound(arr)
			}

			if (moving) {
				p1.playAnimation('walk')
			}
			else {
				p1.playAnimation('stay')
			}

			if (p1.y > GAME_SIZE - 64)
			{
				p1.dy = 0;
			}

			p1.update()
		},

		render: function() {
			
			sprites.map( x => x.render())
			p1.render()
		},
	})

	var AudioContext = window.AudioContext // Default
    || window.webkitAudioContext // Safari and old versions of Chrome
    || false; 
	var context = new AudioContext();
	function playSound(arr) {
		var buf = new Float32Array(arr.length)
		for (var i = 0; i < arr.length; i++) buf[i] = arr[i]
		var buffer = context.createBuffer(1, buf.length, context.sampleRate)
		if(buffer.copyToChannel)
        {
            buffer.copyToChannel(buf, 0);
        }
        else
        {
            // Safari doesn't support copyToChannel yet. See #286
            buffer.getChannelData(0).set(buf);
        }
		var source = context.createBufferSource();
		source.buffer = buffer;
		source.connect(context.destination);
		source.start(0);
	}

	function sineWaveAt(sampleNumber, tone) {
		var sampleFreq = context.sampleRate / tone
		return Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2)))
	}

	loop.start()
}



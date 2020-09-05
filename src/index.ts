/* Frog Jumper
   - JS13K Game Entry 2020
   - 404 Challenge... wheres my semi colons ToT
   - (c) Rob Murrer sans the frog.gif from opengameart.org o/
*/

import kontra, { init, Sprite, GameLoop, SpriteSheet, imageAssets, initKeys, keyPressed } from 'kontra' 

const GAME_SIZE = 512
const SPRITE_SIZE = 16

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
	p1key_jump: KeyDelta,

}

let state : FGState = {
	p1wins: false,
	p1key_up: {old: false, new: false}, 
	p1key_down: {old: false, new: false},
	p1key_left: {old: false, new: false},
	p1key_right: {old: false, new: false},
	p1key_jump: {old: false, new: false},
};

//must do this first!!!
let { canvas } = init()
initKeys();

//load sprite... should consider going full pixel art bitmap in source
//this is why i don't understand javascripts
let frogo = new Image()
frogo.src = 'assets/images/frog.gif'
frogo.onload = function() {
	let spriteSheet = SpriteSheet({
		image: frogo,
		frameWidth: SPRITE_SIZE,
		frameHeight: SPRITE_SIZE,
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

	
	let sprites = []
	for (let i=0; i<100; i++)
	{
		let sprite = Sprite({
			x:(i+SPRITE_SIZE*i*i)%GAME_SIZE,
			y:kontra.randInt(0, SPRITE_SIZE),
			dy: 0.51 + kontra.randInt(0, SPRITE_SIZE)*.1,
			dx: 1 * kontra.randInt(0,1)*-1 + kontra.randInt(0, SPRITE_SIZE)*.1,
			animations: spriteSheet.animations
		})
		sprites.push(sprite)
	}

	let loop = GameLoop({
		update: function() {
			state.p1key_up.old = state.p1key_up.new
			state.p1key_left.old = state.p1key_left.new
			state.p1key_down.old = state.p1key_down.new
			state.p1key_right.old = state.p1key_right.new
			state.p1key_jump.old = state.p1key_jump.new

			state.p1key_up.new= keyPressed('w')
			state.p1key_left.new = keyPressed('a')
			state.p1key_down.new = keyPressed('s')
			state.p1key_right.new = keyPressed('d')
			state.p1key_jump.new = keyPressed('space')

			const swp = 3.14/1.0
			
			sprites.map( x => x.y > GAME_SIZE ? x.y = -SPRITE_SIZE : x.y = x.y)
			sprites.map( x => x.x > GAME_SIZE ? x.dx = -x.dx : x.dx = x.dx)
			sprites.map( x => x.x === 0 ? x.dx = -x.dx : x.dx = x.dx)
			sprites.map( x => x.playAnimation(kontra.randInt(0,10) === 1 ? 'stay' : 'turbo'))
			sprites.map( x => x.update())

			/*
			let moving = false
			let jumping = false
			if (state.p1key_jump.new) {
				sprite.y = sprite.y - swp*swp;
				moving = true
				jumping = true
				sprite.playAnimation('turbo')
			}

			if (state.p1key_up.new) {
				//sprite.dy = -swp;
				sprite.y = sprite.y - swp
				moving = true
				sprite.playAnimation('jump')
			}

			if (state.p1key_down.new) {
				//sprite.dy = swp;
				sprite.y = sprite.y + swp
				moving = true
				sprite.playAnimation('jump')
			}
			if (state.p1key_left.new) {
				//sprite.dx = -swp;
				sprite.x = sprite.x - swp
				moving = true
				sprite.playAnimation('jump')
			}

			if (state.p1key_right.new) {
				//sprite.dx = swp;
				sprite.x = sprite.x + swp
				moving = true
				sprite.playAnimation('jump')
			}

			if (sprite.y <= SPRITE_SIZE*4)
			{
				console.log('boom')
				sprite.dy = 0
				moving = false
			}

			if (!moving) {
				sprite.playAnimation('stay')
				sprite.dy = 0.1
			}


			sprite.update()

			if (sprite.y < 0) {
				state.p1wins = true
			}
			*/

		},

		render: function() {
			
			sprites.map( x => x.render())

			let score = kontra.Text({
				text: 'FROG JUMPER',
				font: '64px Chalkboard, Comic Sans',
				color: 'black', 
				width: GAME_SIZE,
				x:0,
				y:GAME_SIZE/2-SPRITE_SIZE*2,
				textAlign: 'center',
			})

			score.render();	

		},
	})

	loop.start();
}



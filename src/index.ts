/* Frog Jumper
   - JS13K Game Entry 2020
   - 404 Challenge... wheres my semi colons ToT
   - (c) Rob Murrer sans the frog.gif & chicken.pngfrom opengameart.org o/
*/

import kontra from 'kontra'

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
let { canvas } = kontra.init()
kontra.initKeys();

let frogo = new Image()
frogo.src = 't.png'
frogo.onload = function() {
	let frogo_sheet = kontra.SpriteSheet({
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

	let chicko_sheet = kontra.SpriteSheet({
		image: frogo, 
		frameWidth: SPRITE_SIZE*4,
		frameHeight: SPRITE_SIZE*4,
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

	let p1 = kontra.Sprite({
		x:GAME_SIZE/2,
		y:GAME_SIZE/2,
		animations: chicko_sheet.animations,
	})

	
	let sprites = []
	for (let i=0; i<100; i++)
	{
		let sprite = kontra.Sprite({
			x:(i+SPRITE_SIZE*i*i)%GAME_SIZE,
			y:kontra.randInt(0, SPRITE_SIZE),
			dx: kontra.randInt(0,1)*-1 + (kontra.randInt(0, SPRITE_SIZE)*.1),
			dy: kontra.randInt(0,1)*-1 + (kontra.randInt(0, SPRITE_SIZE)*.1),
			animations: frogo_sheet.animations
		})
		sprites.push(sprite)
	}

	let loop = kontra.GameLoop({
		update: function() {
			state.p1key_up.old = state.p1key_up.new
			state.p1key_left.old = state.p1key_left.new
			state.p1key_down.old = state.p1key_down.new
			state.p1key_right.old = state.p1key_right.new
			state.p1key_jump.old = state.p1key_jump.new

			state.p1key_up.new= kontra.keyPressed('w')
			state.p1key_left.new = kontra.keyPressed('a')
			state.p1key_down.new = kontra.keyPressed('s')
			state.p1key_right.new = kontra.keyPressed('d')
			state.p1key_jump.new = kontra.keyPressed('space')

			const swp = 3.14/1.0
			
			sprites.map(x => function () {
				if (x.y > GAME_SIZE || x.y < 0) {
					x.dy = -x.dy
				} 

				if (x.x > GAME_SIZE || x.x === 0) {
					x.dx = -x.dx
				}

				x.playAnimation(kontra.randInt(0,100) === 1 ? 'stay' : 'turbo')
				x.update()

			}())//gotta execute it w. the () at the end of function {}() :D

			let moving = true
			let jumping = false
			if (state.p1key_jump.new) {
				p1.y = p1.y - swp*swp;
				//p1.playAnimation('turbo')
			}

			if (state.p1key_up.new) {
				//sprite.dy = -swp;
				p1.y = p1.y - swp
				//p1.playAnimation('jump')
			}

			if (state.p1key_down.new) {
				//sprite.dy = swp;
				p1.y = p1.y + swp
				//sprite.playAnimation('jump')
			}
			if (state.p1key_left.new) {
				//sprite.dx = -swp;
				p1.x = p1.x - swp
				//p1.playAnimation('jump')
			}

			if (state.p1key_right.new) {
				//sprite.dx = swp;
				p1.x = p1.x + swp
				//sprite.playAnimation('jump')
			}

			if (moving) {
				p1.playAnimation('walk')
			}
			else {
				p1.playAnimation('stay')
			}

			p1.update()
		},

		render: function() {
			
			sprites.map( x => x.render())
			p1.render()

			/*
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
			*/

		},
	})

	loop.start();
}



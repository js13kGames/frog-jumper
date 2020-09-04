import kontra, { init, Sprite, GameLoop, SpriteSheet, imageAssets, initKeys, keyPressed } from 'kontra' 

let { canvas } = init()


let frogo = new Image()
frogo.src = 'assets/images/frog.gif'
frogo.onload = function() {
}

let spriteSheet = SpriteSheet({
	image: frogo,
	frameWidth: 16,
	frameHeight: 16,
	animations: {
		jump: {
			frames: '0..1',
			frameRate: 10, 
		}
	}
})

let sprite = Sprite({
	x:256,
	y:256,
	dy:0,
	dx:0,
	animations: spriteSheet.animations
})

let lefty_state = false;
interface FGState {
	p1key_up: boolean,
	p1key_down: boolean,
	p1key_left: boolean,
	p1key_right: boolean,
	p1key_jump: boolean,

}

let state : FGState = {
	p1key_up: false,
	p1key_down: false,
	p1key_left: false,
	p1key_right: false,
	p1key_jump: false,
};

initKeys();
let loop = GameLoop({

	update: function() {
		sprite.update()

		
		if (sprite.y < 0) {
			sprite.y = 512
		}

		if (sprite.x < 0) {
			sprite.x = 512
		}

		if (sprite.y > 512) {
			sprite.y = 0
		}
		if (sprite.x > 512) {
			sprite.x = 0
		}

		state.p1key_up = keyPressed('w')
		state.p1key_left = keyPressed('a')
		state.p1key_down = keyPressed('s')
		state.p1key_right = keyPressed('d')
		state.p1key_jump = keyPressed('space')

		const swp = 3.14
		if (state.p1key_jump) {
			sprite.y = sprite.y - swp*swp;
		}

		if (state.p1key_up) {
			//sprite.dy = -swp;
			sprite.y = sprite.y - swp
		}

		if (state.p1key_down) {
			//sprite.dy = swp;
			sprite.y = sprite.y + swp
		}
		if (state.p1key_left) {
			//sprite.dx = -swp;
			sprite.x = sprite.x - swp
		}

		if (state.p1key_right) {
			//sprite.dx = swp;
			sprite.x = sprite.x + swp
		}


		//sprite.playAnimation('jump');

	},

	render: function() {
		sprite.render()
	}
})

loop.start();



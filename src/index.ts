/* Frog Jumper
   - JS13K Game Entry 2020
   - 404 Challenge... Dude where's my semi colons 
   - (c) Rob Murrer with many thanks to...
		   - frog.gif  ...
		   - chicken.png from opengameart.org
		   - kontra.js - Lambert
		   - zzfx sound effects
   - o/
*/

import {
	init, 
	initKeys, 
	SpriteSheet, 
	Sprite, 
	randInt,
	GameLoop, 
	keyPressed, 
	Button, 
	initPointer, 
	onPointerDown, 
	onPointerUp, 
	Text, 
	clamp, 
 	seedRand
	} from 'kontra'

import { zzfx } from './third/ZzFX.micro.js'

const GAME_SIZE = 512
const FROG_SIZE = 16 

interface FJState {
	screen: number,
	frame_count: number;
	score: number,
	lives: number,
	level: number,
	difficulty: number,

	chest: [],

	frogs: number,

	jump_started: boolean,
	jump_x: number,
	jump_y: number,
	jump_clock: number,
	jumping: boolean,
	
	frogo_right: boolean,
	speed: number,

	tap: boolean,

}


let state : FJState = {
	screen: 0,
	frame_count: 0,
	score: 0,
	difficulty: 0,
	lives: 30,
	level: 0,

	chest: [],
	frogs: 0,

	jump_started: false,
	jump_x: 0,
	jump_y: 0,
	jumping: false,
	jump_clock: 0,

	frogo_right: true,
	speed: 0,

	tap: false,
}

interface FJLevel {
	seed: number,
	sky_colors: string[], 
	sky_emojis: string[], 

	background_colors: string[],
	background_emojis: string[],

	field_colors: string[], 
	field_emojis:string[],
	field_emojis_func: number[],

	floor_colors: string[], 
	floor_emojis: string[],
	floor_emojis_func: number[],

	hi_enemies: string[],
	hi_enemies_vuln: number[],
	hi_enemies_vects: number[][], 

	lo_enemies: string[],
	lo_enemies_vuln: number[],
	lo_enemies_vects: number[][],
	
	enemy_wave_vect: number[],
	chest_wave_vect: number[],
	chest_emojis: string[],
}


//must do this first!!!
let { canvas } = init()
initKeys()
initPointer()

onPointerDown(function(e, object) { //global play to turn on sounds in safari :D
	zzfx(...[,,210,.03,,,,.85,-46,,,,,.7,,,.04,,.03,.74]); // Blip 54
	//zzfx(...[,,1516,,.04,.15,,.01,,,562,.06,,,,,.09,.62,.02]); // Pickup 29
	state.tap = true
})

onPointerUp(function(e, object) {
	zzfx(...[,,210,.03,,,,.85,-46,,,,,.7,,,.04,,.03,.74]); // Blip 54
	state.tap = false
})

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
				frameRate: 30, 
			}
		}
	})

	//frogo.width = -frogo.width doesn't flip full sprite sheet... 
	let chicko_sheet = SpriteSheet({
		image: frogo, 
		frameWidth: 64,
		frameHeight: 64, 
		animations: {
			stay:
			{
				frames:1,
			},
			walk:
			{
				frames: '1..2',
				frameRate: 10,
			}
		}
	})

	let level_zero: FJLevel = {
		seed: 0,
		sky_colors: ['lightblue',],
		sky_emojis: ['☁️',],

		background_colors: ['darkblue',],
		background_emojis: ['🌲'],

		field_colors: ['#89d69e',],
		field_emojis: ['🍒', '🧚‍♀️', '🦅'],
		field_emojis_func: [10,100, -10],

		floor_colors: ['green',],
		floor_emojis: ['🍄', '🔥'],
		floor_emojis_func: [1, -1],

		hi_enemies: ['🦅'],
		hi_enemies_vects: [[-1, -10]],
		hi_enemies_vuln: [0,],

		lo_enemies: ['🦂'],
		lo_enemies_vects: [[-1, 0]],
		lo_enemies_vuln: [0,],

		chest_emojis: ['🥾', '🎩'],
		enemy_wave_vect: [0, 0, 1, 0, 0, 0, 0, 0, 0],
		chest_wave_vect: [0, 0, 1, 0, 0, 0, 0, 0, 0],
	}

	
	const SKY = 300
	const FIELD = SKY + 100 
	const FLOOR = GAME_SIZE - 4*FROG_SIZE

	let p1 = Sprite({
		x: 4*FROG_SIZE,
		y: FLOOR,
		animations: chicko_sheet.animations,
	})

	let frog = Sprite({
		x: p1.x + 4*FROG_SIZE, 
		y: FLOOR + 2*FROG_SIZE + 5, 
		animations: frogo_sheet.animations,
		dx: -1
	})

	let floor = Sprite({
		width: GAME_SIZE,
		height: FROG_SIZE,
		x:0,
		y: GAME_SIZE-FROG_SIZE,
	})

	let field = Sprite({
		width: GAME_SIZE,
		height: FIELD,
		x:0,
		y: SKY, 

	})

	let sky = Sprite({
		width: GAME_SIZE,
		height: SKY,
		x: 0,
		y: 0, 
	})


	let level = level_zero
	let first_time = true 
	let loop = GameLoop({
		update: function() {
			if (state.lives < 0) {
					let title = Text({
						text: "☠️ YOU LOSE",
						x: 0, 
						color: 'darkgreen', 
						font: '64px Impact, Lucida',
						dy: -0.1,
					})

					field.addChild(title)
					p1.playAnimation('stay')
			}
			else {
				if (state.frame_count === 0) {
					if (first_time) {
						seedRand(level.seed.toString()) //same everytime (no worky?)

						sky.color = level.sky_colors[0]
						field.color = level.field_colors[0]
						floor.color = level.floor_colors[0]

						let title = Text({
							text: "FROG JUMPER",
							x: 0, 
							color: 'darkgreen', 
							font: '64px Impact, Lucida', 
						})

						field.addChild(title)
						first_time = false 
					}

					if (!state.tap) return
					console.log('level started')
					state.speed = 3 

					sky.children.map(x => x.dx = -state.speed/2)
					field.children.map(x => x.dx = -state.speed)
					floor.children.map(x => x.dx = -state.speed*2)
					p1.playAnimation('walk')
					frog.playAnimation('jump')

				}

				p1.dy = p1.dy + 0.2
				frog.dx = frog.dx - 0.05

				if (p1.y >= FLOOR) {
					p1.dy = 0
					p1.dx = 0
					p1.playAnimation('walk')
					frog.playAnimation('jump')
					state.jumping = false
					state.jump_started = false
				}
				else {
				}

				if (frog.x < FROG_SIZE) {
					frog.dx = -frog.dx 
				}


				if (state.tap) {
					if (state.jump_started) {
						console.log('in air')
						if (Math.abs(p1.x - frog.x) < FROG_SIZE) {
							p1.dy = -10
							p1.playAnimation('walk')
							console.log('hit')
							zzfx(...[,,1516,,.04,.15,,.01,,,562,.06,,,,,.09,.62,.02]); // Pickup 29
						}
						else {
							p1.playAnimation('stay')
						}
						
					}
					else {
						p1.playAnimation('stay')
						state.jump_clock = performance.now()
						state.jump_x = p1.x
						state.jump_y = p1.y
						state.jumping = true
						p1.dy = -5
						//p1.dx = 1
						state.jump_started = true
					}

					state.tap = false
				}

				state.frame_count++

				//todo clean up stuff
				//level gen
				if (state.frame_count%300 === 0) {
					let score = Text({
						text: state.score.toString(),
						vect: 100,
						x: GAME_SIZE,
						dx: -state.speed*2,
						color: 'darkgreen',
						font: '64px Impact, Lucida',
					})
					field.addChild(score)

					state.screen++
					console.log('nol')
					for (let i = 0; i < randInt(0, 10); i++) {
						let s = Text({
							font: "12px Helvetica",
							text: level.sky_emojis[i % level.sky_emojis.length],
							x: GAME_SIZE + randInt(0, GAME_SIZE),
							y: randInt(0, SKY - 8 * FROG_SIZE),
							scaleX: 5,
							scaleY: 5,
							dx: -state.speed/2

						})

						sky.addChild(s)
					}

					for (let i = 0; i < randInt(0, 5); i++) {
						let s = Text({
							font: "12px Helvetica",
							text: level.background_emojis[i % level.background_emojis.length],
							x: GAME_SIZE + randInt(0, GAME_SIZE),
							y: -20, 
							scaleX: 4,
							scaleY: 4,
							dx: -state.speed/2,
							tree: true,

						})

						field.addChild(s)
					}

					for (let i = 0; i < randInt(0, 10); i++) {
						let idx = i%level.field_emojis.length
						let s = Text({
							text: level.field_emojis[idx],
							vect: level.field_emojis_func[idx], 
							x: GAME_SIZE + randInt(0, GAME_SIZE),
							y: randInt(0, FIELD-2*FROG_SIZE),
							dx: -state.speed,
							scaleX:3,
							scaleY:3,
						})

						field.addChild(s)
					}

					for (let i = 0; i < randInt(0, 10); i++) {
						let idx = i%level.floor_emojis.length
						let s = Text({
							text: level.floor_emojis[idx],
							vect: level.floor_emojis_func[idx],
							x: GAME_SIZE + randInt(0, GAME_SIZE),
							y: -10,
							dx: -state.speed*2 
						})

						floor.addChild(s)
					}
					if (state.screen === level.enemy_wave_vect.length + 1) {
						console.log('level done')
						let s = Text({
							text: '🏁',
							x: GAME_SIZE, 
							y: -100,
							dx: -state.speed/4,
							finish: true, 
							scaleX: 5,
							scaleY: 5,
						})
						floor.addChild(s)
					}
				}

				field.children.map(s => {
					if (s.finish && p1.x === s.x) {
						zzfx(...[, , 528, .04, .15, .27, , 1.48, 1, -0.1, 452, .06, , , , , , .65, .07]); // Powerup 108
						p1.dy = -10
						frog.dy = -11
						s.dy = 10
						state.speed += 1
					}

					if (Math.abs(s.x - p1.x) < 2*FROG_SIZE && Math.abs((s.parent.y + s.y) - p1.y) < 2*FROG_SIZE) {
						if (s.tree) return
						if (s.vect > 0) {
							state.score += s.vect
							zzfx(...[, , 395, , , .17, , 1.38, .9, -0.4, , , , , , .1, .13, .54, .03, .05]); // Shoot 107
							s.dy = -11
						}
						else {
							s.dy = 11
							state.lives--
							zzfx(...[, , 44, .03, .02, 0, 3, .05, , , , , , , , , , .18, .15]); // Random 105
						}
					}
				})

				floor.children.map(s => {

					if (!state.jumping) {
						if (Math.abs(s.x - p1.x) < 2*FROG_SIZE) {
							if (s.ttl && s.ttl === 0) {
								return
							}
							else {
								s.ttl = 0
							}
							if (s.vect > 0) {
								zzfx(...[, , 395, , , .17, , 1.38, .9, -0.4, , , , , , .1, .13, .54, .03, .05]); // Shoot 107
								s.dy = -11
								state.score += s.vect
							}
							else {
								zzfx(...[, , 44, .03, .02, 0, 3, .05, , , , , , , , , , .18, .15]); // Random 105
								s.dy = 11
								state.lives--
								console.log('ding')
							}
						}
					}
				})
				//floor.map( x => {if (Math.abs(x.x - p1.x) < 1) { zzfx(...[,,1516,,.04,.15,,.01,,,562,.06,,,,,.09,.62,.02])}}
			}

			sky.update()
			field.update()
			floor.update()
			p1.update() 
			frog.update()
		},

		render: function() {
			sky.render()
			field.render()
			floor.render()

			frog.render()
			p1.render()
		},
	})

	loop.start()
}



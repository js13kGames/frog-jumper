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
	lives: 3,
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
		field_emojis: ['🍒', '🧚‍♀️'],
		field_emojis_func: [1,10],

		floor_colors: ['green',],
		floor_emojis: ['🍄', '🍉'],
		floor_emojis_func: [1, -1],

		hi_enemies: ['🦅'],
		hi_enemies_vects: [[-1, -1]],
		hi_enemies_vuln: [0,],

		lo_enemies: ['🦂'],
		lo_enemies_vects: [[-1, 0]],
		lo_enemies_vuln: [0,],

		chest_emojis: ['🥾', '🎩'],
		enemy_wave_vect: [0, 1, 2, 3],
		chest_wave_vect: [0, 0, 1, 0],
	}

	let level_one: FJLevel = {
		seed: 0,
		sky_colors: ['lightblue',],
		sky_emojis: ['☁',],

		background_colors: ['darkblue',],
		background_emojis: ['🌲'],

		field_colors: ['#89d69e',],
		field_emojis: ['🍒', '🧚‍♀️'],
		field_emojis_func: [1,10],

		floor_colors: ['green',],
		floor_emojis: ['🍄', '🍉'],
		floor_emojis_func: [1, -1],

		hi_enemies: ['🦅'],
		hi_enemies_vects: [[-1, -1]],
		hi_enemies_vuln: [0,],

		lo_enemies: ['🦂'],
		lo_enemies_vects: [[-1, 0]],
		lo_enemies_vuln: [0,],

		chest_emojis: ['🥾', '🎩'],
		enemy_wave_vect: [0, 1, 2, 3],
		chest_wave_vect: [0, 0, 1, 0],
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
			if (state.frame_count === 0) {
				if (first_time) {
					seedRand(level.seed.toString()) //same everytime

					sky.color = level.sky_colors[0]
					field.color = level.field_colors[0]
					floor.color = level.floor_colors[0]

					for (let i=0; i< 6; i++) {
						let s = Text({
							text: level.sky_emojis[i%level.sky_emojis.length],
							x: randInt(0, GAME_SIZE),
							y: randInt(0, SKY-4*FROG_SIZE),
							scaleX: 5,
							scaleY: 5,

						})

						sky.addChild(s)
					}

					for (let i=0; i<3; i++) {
						let s = Text({
							text: level.field_emojis[i%level.field_emojis.length],
							x: randInt(GAME_SIZE/2, GAME_SIZE),
							y: randInt(0, FIELD)
						})

						field.addChild(s)
					}
					for (let i=0; i<1; i++) {
						let s = Text({
							text: level.floor_emojis[i%level.floor_emojis.length],
							x: randInt(GAME_SIZE/2, GAME_SIZE),
							y: -10, 
						})

						floor.addChild(s)
					}

					let title = Text({
						text: "FROG JUMPER",
						x: 0, 
						y: -64, 
						color: 'darkgreen', 
						font: '64px Monaco, Consolas',
					})

					field.addChild(title)
					first_time = false 
				}


				if (!state.tap) return

				console.log('level started')
				state.speed = 1

				sky.children.map(x => x.dx = -state.speed/2)
				field.children.map(x => x.dx = -state.speed)
				floor.children.map(x => x.dx = -state.speed*2)
				p1.playAnimation('walk')
				frog.playAnimation('jump')

			}

			p1.dy = p1.dy + 0.1
			frog.dx = frog.dx - 0.005

			if (p1.y > FLOOR) {
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
				frog.dx = 1 
			}

			

			if (state.tap) {
				if (state.jump_started) {
					console.log('in air')
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
			if (state.frame_count%(500/state.speed) === 0) {
				state.screen++
				console.log('nol')
				for (let i = 0; i < randInt(0, 5); i++) {
					let s = Text({
						font: "12px Helvetica",
						text: level.sky_emojis[i % level.sky_emojis.length],
						x: GAME_SIZE + randInt(0, GAME_SIZE),
						y: randInt(0, SKY - 4 * FROG_SIZE),
						scaleX: 5,
						scaleY: 5,
						dx: -state.speed/2

					})

					sky.addChild(s)
				}

				for (let i = 0; i < randInt(0, 5); i++) {
					let s = Text({
						font: "12px arial",
						text: level.background_emojis[i % level.background_emojis.length],
						x: GAME_SIZE + randInt(0, GAME_SIZE),
						y: -50, 
						scaleX: 4,
						scaleY: 4,
						dx: -state.speed/2

					})

					field.addChild(s)
				}

				for (let i = 0; i < randInt(0, 5); i++) {
					let s = Text({
						text: level.field_emojis[i % level.field_emojis.length],
						x: GAME_SIZE + randInt(0, GAME_SIZE),
						y: randInt(0, FIELD),
						dx: -state.speed
					})

					field.addChild(s)
				}

				for (let i = 0; i < randInt(0, 1); i++) {
					let s = Text({
						text: level.floor_emojis[i % level.floor_emojis.length],
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
						y: -20,
						dx: -state.speed
					})
					floor.addChild(s)
				}
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

			p1.render()
			frog.render()
		},
	})

	loop.start()
}



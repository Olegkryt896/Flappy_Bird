const cvs = document.getElementById('bird')
const ctx = cvs.getContext('2d')

var frames = 0

const DEGREE = Math.PI / 180

const sprite = new Image()
sprite.src = '/sprite.png'

// Контроль игры

const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
}

// кнопка пуск

const startBtn = {
  x: 120,
  y: 263,
  w: 63,
  h: 29,
}

cvs.addEventListener('click', function (evt) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game
      break

    case state.game:
      bird.flap()
      break

    case state.over:
      let rect = cvs.getBoundingClientRect()
      let clickX = evt.clientX - rect.left
      let clickY = evt.clientY - rect.top

      // проверка нажатия старта

      if (
        clickX >= startBtn.x &&
        clickX <= startBtn.x + startBtn.w &&
        clickY >= startBtn.y &&
        clickY <= startBtn.y + startBtn.h
      ) {
        state.current = state.getReady
        pipes.reset()
        score.value = 0
        bird.speed = 0
      }
      break
  }
})

//

const bg = {
  //фон
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: cvs.height - 226,

  draw: function () {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    )

    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    )
  },
}

const fg = {
  //передний план (земля)
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,
  dx: 2,

  draw: function () {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    )
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    )
  },

  update: function () {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % (this.w / 2)
    }
  },
}

const bird = {
  // Птица =================================================================
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 },
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,

  radius: 12,

  frame: 0,

  gravity: 0.25,
  jump: 4.6,
  speed: 0,
  rotation: 0,

  draw: function () {
    let bird = this.animation[this.frame]

    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    )

    ctx.restore()
  },

  flap: function () {
    this.speed = -this.jump
  },

  update: function () {
    this.period = state.current == state.getReady ? 10 : 5
    this.frame += frames % this.period == 0 ? 1 : 0
    this.frame = this.frame % this.animation.length

    if (state.current == state.getReady) {
      this.y = 150
      this.rotation = 0 * DEGREE
    } else {
      this.speed += this.gravity
      this.y += this.speed

      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2
        if (state.current == state.game) {
          state.current = state.over
        }
        this.rotation = 90 * DEGREE
        this.frame = 1
      }
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE
      } else if (this.speed == 0) {
        this.rotation = 90 * DEGREE
      } else {
        this.rotation = -25 * DEGREE
      }
    }
  },
}

const pipes = {
  //трубы =================================================================
  position: [],

  top: {
    sX: 553,
    sY: 0,
  },

  bottom: {
    sX: 502,
    sY: 0,
  },

  w: 53,
  h: 400,
  gap: 85,
  maxYPos: -150,
  dx: 2,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i]

      let topYPos = p.y
      let bottomYPos = p.y + this.h + this.gap

      //верхняя труба
      ctx.drawImage(
        sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      )
      //нижняя труба
      ctx.drawImage(
        sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      )
    }
  },

  update: function () {
    if (state.current !== state.game) return

    if (frames % 100 == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1),
      })
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i]

      p.x -= this.dx
      let bottomPipeYPos = p.y + this.h + this.gap

      //обнаружение столкновения с верхней трубой

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.over
      }

      //обнаружение столкновения с нижней трубой

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeYPos &&
        bird.y - bird.radius < bottomPipeYPos + this.h
      ) {
        state.current = state.over
      }

      // если трубы вышли за пределы холста , удаляем их из массива
      if (p.x + this.w <= 0) {
        this.position.shift()
        score.value += 1
        score.best = Math.max(score.value, score.best)
        localStorage.setItem('best', score.best)
      }
      
    }
  },

  reset: function () {
    this.position = []
  },
}

const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,

  draw: function () {
    if (state.current == state.getReady) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      )
    }
  },
}

const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 90,

  draw: function () {
    if (state.current == state.over) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      )
    }
  },
}

const score = {
  best: parseInt(localStorage.getItem('best')) || 0,
  value: 0,

  draw: function () {
    ctx.fillStyle = '#FFF'
    ctx.strokeStyle = '#000'

    if (state.current == state.game) {
      ctx.lineWidth = 2
      ctx.font = '35px sans-serif'
      ctx.fillText(this.value, cvs.width / 2, 50)
      ctx.strokeText(this.value, cvs.width / 2, 50)
    } else if (state.current == state.over) {
      // текущий счет
      ctx.font = '25px sans-serif'
      ctx.fillText(this.value, 225, 186)
      ctx.strokeText(this.value, 225, 186)
      // лучший счет

      ctx.fillText(this.best, 225, 228)
      ctx.strokeText(this.best, 225, 228)
    }
  },
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, cvs.width, cvs.height)

  bg.draw()
  pipes.draw()
  fg.draw()
  bird.draw()
  getReady.draw()
  gameOver.draw()
  score.draw()
}

function update() {
  bird.update()
  fg.update()
  pipes.update()
}

function loop() {
  update()
  draw()
  frames++

  requestAnimationFrame(loop)
}

loop()

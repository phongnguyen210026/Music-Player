const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const STORAGE_KEY = 'PLAYER'

const cd = $('.cd')
const header = $('header h2')
const thumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volume = $('#volume')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(STORAGE_KEY))||{},
    setConfig(key,value){
        this.config[key]=value
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
    },
    songPlayed: [],
    songs: [
        {
            name: '1 step forward, 3 steps back',
            singer: 'Olivia Rodrigo',
            path: './assets/music/1_step_forward_3_steps_back-Sweethiphop.com.mp3',
            image: './assets/img/1stepfoward.jpg'
        },
        {
            name: 'closure',
            singer: 'Henry Moodie',
            path: './assets/music/closure.mp3',
            image: './assets/img/closure.jpg'
        },
        {
            name: 'Intrusive Thoughts',
            singer: 'Natalie Jane',
            path: './assets/music/IntrusiveThoughts.mp3',
            image: './assets/img/intrusivethoughts.png'
        },
        {
            name: 'you were good to me',
            singer: 'Jeremy Zucker, Chelsea Cutler',
            path: './assets/music/Jeremy Zucker Chelsea Cutler  you were good to me Official Video.mp3',
            image: './assets/img/you were good to me.webp'
        },
        {
            name: 'Keep Your Head Up Princess',
            singer: 'Anson Seabra',
            path: './assets/music/Keep_Your_Head_Up_Princess.mp3',
            image: './assets/img/keep your head up pricess.jpg'
        },
        {
            name: 'Liability',
            singer: 'Lorde',
            path: './assets/music/Lorde  Liability.mp3',
            image: './assets/img/liability.png'
        },
        {
            name: 'Love Me Like The First Time',
            singer: 'Rachel Grae',
            path: './assets/music/Love Me Like The First Time.mp3',
            image: './assets/img/love me like the first time.jpg'
        },
        {
            name: 'Falling Apart',
            singer: 'Michael Schulte',
            path: './assets/music/Michael Schulte  Falling Apart Official Video.mp3',
            image: './assets/img/falling apart.webp'
        },
        {
            name: 'Older',
            singer: 'Sasha Alex Sloan',
            path: './assets/music/Sasha-Sloan-Older-Now-Whats-Next.mp3',
            image: './assets/img/older.webp'
        },
        {
            name: 'Stranger',
            singer: 'Thomas Day',
            path: './assets/music/Stranger.mp3',
            image: './assets/img/stranger.jpg'
        }
    ],
    render(){
        const htmls = this.songs.map((song,index)=>`
        <div class="song ${index===this.currentIndex?'active':''}" data-index=${index}>
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`)
        playlist.innerHTML = htmls.join('')
    },
    defineProperties(){
        Object.defineProperty(this, 'currentSong', {
            get(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent(){
        
        //rotate thumb
        const thumbAnimate = thumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })

        thumbAnimate.pause()

        const cdWidth = cd.offsetWidth

        playBtn.onclick = function(){
            if(app.isPlaying){
                audio.pause()
            }else{
                audio.play()
            }
        }

        // check is playing
        audio.onplay = function(){
            app.isPlaying = true
            player.classList.add('playing')
            thumbAnimate.play()
        }

        //check is not playing
        audio.onpause = function(){
            app.isPlaying = false
            player.classList.remove('playing')
            thumbAnimate.pause()
        }

        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor((audio.currentTime/audio.duration)*100)
                progress.value = progressPercent

                app.setConfig('audioDuration',audio.duration)
                app.setConfig('progress',progressPercent)
            }
        }

        progress.oninput = function(){
            const seekTime = (this.value/100)*audio.duration
            audio.currentTime = seekTime
        }

        progress.onmousedown = function(){ audio.pause(); player.classList.remove('playing') }
        progress.onmouseup = function(){ audio.play(); player.classList.add('playing') }

        // handle zoom-in/zoom-out cd
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth-scrollTop
            cd.style.width = newWidth>0?newWidth +'px':0
            cd.style.opacity = newWidth/cdWidth
        }

        nextBtn.onclick = function(){
            if(app.isRandom){
                app.playRandomSong()
            }else{
                app.nextSong()
            }
            app.loadCurrentSong()
            audio.play()
            $('.song.active').classList.remove('active')
            $$('.song').forEach((song,index)=>{
                if(index === app.currentIndex){
                    song.classList.add('active')
                }
            })
            app.scrollToActiveSong()
        }
        prevBtn.onclick = function(){
            if(app.isRandom){
                app.playRandomSong()
            }else{
                app.prevSong()
            }
            app.loadCurrentSong()
            audio.play()
            $('.song.active').classList.remove('active')
            $$('.song').forEach((song,index)=>{
                if(index === app.currentIndex){
                    song.classList.add('active')
                }
            })
            app.scrollToActiveSong()
        }

        randomBtn.onclick = function(){
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom)
        }

        repeatBtn.onclick = function(){
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat)
        }

        // auto next when ended
        audio.onended = function(){
            if(app.isRepeat){
                audio.play()
            }else{
                nextBtn.click() // click() method likes click action. It means click button is clicked 
            }
        }

        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                setTimeout(()=>{
                    if(songNode){
                        app.currentIndex = Number(songNode.dataset.index)
                        app.setConfig('songIndex', app.currentIndex)
                        app.loadCurrentSong()
                        $('.song.active').classList.remove('active')
                        $$('.song').forEach((song,index)=>{
                            if(index === app.currentIndex){
                                song.classList.add('active')
                            }
                        })
                        audio.play()
                    }
                }, 500)
            }
        }

        // volume
        volume.oninput = function(e){
            const volumeVal = e.target.value
            audio.volume = volumeVal/100
            app.setConfig('volume', volumeVal)
        }
    },
    loadCurrentSong(){
        header.textContent = this.currentSong.name
        thumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    nextSong(){
        this.currentIndex++
        if(this.currentIndex == this.songs.length){
            this.currentIndex = 0
        }
        this.setConfig('songIndex',this.currentIndex)
    },
    prevSong(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1
        }
        this.setConfig('songIndex',this.currentIndex)
    },
    playRandomSong(){
        if(this.songPlayed.length === this.songs.length){
            this.songPlayed.length = 0
        }
        let randomIndex
        do{
            randomIndex = Math.floor(Math.random() * this.songs.length)
        }while(this.songPlayed.includes(randomIndex))
        this.songPlayed.push(randomIndex)
        this.currentIndex = randomIndex
        this.setConfig('songIndex',this.currentIndex)
    },
    scrollToActiveSong(){
        if([0,1,2,3].includes(this.currentIndex)){
            setTimeout(()=>{
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                }, 2000)
            })
        }else{
            setTimeout(()=>{
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                }, 2000)
            })
        }
    },
    loadConfig(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        repeatBtn.classList.toggle('active', app.isRepeat)
        randomBtn.classList.toggle('active', app.isRandom)

        this.currentIndex = this.config.songIndex||0
        this.loadCurrentSong()

        progress.value = this.config.progress
        audio.currentTime = progress.value/100*this.config.audioDuration

        audio.volume = this.config.volume/100 || 1
        volume.value = this.config.volume
    },
    start(){
        this.defineProperties() 
        this.loadConfig()
        this.render()
        this.loadCurrentSong()
        this.handleEvent()
    }
}
app.start()
var bkcore = bkcore || {};
bkcore.hexgl = bkcore.hexgl || {};

sources = [
    "sounds/engine.wav",
    "sounds/crash.wav",
    "sounds/background.wav",
    "sounds/countdown.wav"
];
bkcore.hexgl.Audio = function()
{
    this.background = null;
    this.engine = null;
    this.crashSoundBuffer = null;
    this.countdownSoundBuffer = null;

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);

        this.background = this.context.createBufferSource();
        this.engine = this.context.createBufferSource();
    }

    this.loadInternal = function(url, callback)
    {
        if (!this.context) return;
        
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        var self = this;
        request.onload = function() {
            self.context.decodeAudioData(request.response, function(buffer) {
                callback(buffer);
            }, function() {
                throw new Error("Error decoding audio!");
            });
        };
        request.send();
    }
}

bkcore.hexgl.Audio.prototype.load = function()
{
    var index = 0;

    var self = this;
    function callback(buffer) {
        switch (index) {
            case 0:
                self.engine.buffer = buffer; break;
            case 1:
                self.crashSoundBuffer = buffer; break;
            case 2:
                self.background.buffer = buffer; break;
            case 3:
                self.countdownSoundBuffer = buffer; break;
        }
        index++;
    
        if (index < sources.length)
            self.loadInternal(sources[index], callback);
    }

    if (sources.length > 0)
        this.loadInternal(sources[index], callback);
}

bkcore.hexgl.Audio.prototype.startBackground = function()
{
    this.background.loop = true;
    var gain = this.context.createGain();
    gain.gain.value = 1;
    this.background.connect(gain);
    gain.connect(this.master);
    this.background.playbackRate.value = 2;
    this.background.start(0);
}

bkcore.hexgl.Audio.prototype.playCrash = function()
{
    var source = this.context.createBufferSource();
    source.buffer = this.crashSoundBuffer;
    source.loop = false;
    source.connect(this.master);
    source.start(0);
}

bkcore.hexgl.Audio.prototype.startVehicleEngine = function()
{
    this.engine.loop = true;
    this.engine.connect(this.master);
    this.engine.playbackRate.value = 1;
    this.engine.start(0);
}

bkcore.hexgl.Audio.prototype.powerVehicleEngine = function(value)
{
    this.engine.playbackRate.value = value;
}

bkcore.hexgl.Audio.prototype.startCountdown = function()
{
    var source = this.context.createBufferSource();
    var gain = this.context.createGain();
    gain.gain.value = 2;
    source.buffer = this.countdownSoundBuffer;
    source.loop = false;
    source.connect(gain);
    gain.connect(this.master);
    source.start(0);
}

bkcore.hexgl.audio = new bkcore.hexgl.Audio();
bkcore.hexgl.audio.load();

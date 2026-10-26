"""Original 32-bar daytime courier score; synthesized instruments, no borrowed recordings.

Renders a seamless stereo master into work/audio. Encode the master to Ogg for the game.
104 BPM, D major, electric keys / plucked strings / vibraphone / bass / light percussion.
"""
from pathlib import Path
import json
import wave
import numpy as np

SR = 32000
BPM = 104
BEAT = 60 / BPM
BARS = 32
N = round(BARS * 4 * BEAT * SR)
rng = np.random.default_rng(987)
mix = np.zeros((N, 2), dtype=np.float64)

def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)

def add(signal, seconds, gain=1., pan=0.):
    start = round(seconds * SR) % N
    indices = (start + np.arange(len(signal))) % N
    angle = (pan + 1) * np.pi / 4
    np.add.at(mix[:, 0], indices, signal * gain * np.cos(angle))
    np.add.at(mix[:, 1], indices, signal * gain * np.sin(angle))

def note(midi, length, instrument):
    duration = length + (.55 if instrument != 'bass' else .12)
    t = np.arange(round(duration * SR)) / SR
    phase = 2 * np.pi * frequency(midi) * t
    release = np.exp(-np.maximum(0, t-length) * (13 if instrument == 'bass' else 9))
    if instrument == 'keys':
        body = np.sin(phase + 1.4 * np.exp(-t*6) * np.sin(2*phase))
        body += .18 * np.sin(2.002 * phase) * np.exp(-t*3)
        env = (1-np.exp(-t*220)) * (.8*np.exp(-t*2.3)+.2*np.exp(-t*.7)) * release
    elif instrument == 'pluck':
        body = sum(np.sin(phase*k + .014*k*np.sin(t*7))/(k**1.65) * np.exp(-t*k*.9) for k in range(1,9))
        env = (1-np.exp(-t*500)) * np.exp(-t*3) * release
    elif instrument == 'vibes':
        body = np.sin(phase) + .29*np.sin(phase*3.998)*np.exp(-t*6) + .13*np.sin(phase*10.01)*np.exp(-t*13)
        env = (1-np.exp(-t*350)) * np.exp(-t*2.1) * (.94+.06*np.sin(t*2*np.pi*4.6)) * release
    elif instrument == 'pad':
        body = .65*np.sin(phase*.9993)+.35*np.sin(phase*1.0007)+.1*np.sin(phase*2)
        env = (1-np.exp(-t*6)) * np.exp(-t*.25) * release
    else:
        body = np.sin(phase) + .28*np.sin(phase*2)*np.exp(-t*3) + .06*np.sin(phase*3)
        env = (1-np.exp(-t*270)) * np.exp(-t*2) * release
    return body * env

def kick():
    t=np.arange(round(.22*SR))/SR
    phase=2*np.pi*(50*t+50*.018*(1-np.exp(-t/.018)))
    return np.sin(phase)*np.exp(-t*24)*(1-np.exp(-t*800))

def rim():
    t=np.arange(round(.10*SR))/SR
    return (np.sin(2*np.pi*1130*t)+.5*np.sin(2*np.pi*1773*t))*np.exp(-t*75)*(1-np.exp(-t*1200))

def tick():
    t=np.arange(round(.045*SR))/SR
    return sum(np.sin(2*np.pi*f*t) for f in [5031,7295,8641])/3*np.exp(-t*135)*(1-np.exp(-t*2500))

chords = {
    'D9': ([50,54,57,61,64],38), 'Bm9': ([47,50,54,57,61],35),
    'Em9': ([52,55,59,62,66],40), 'A13': ([45,55,61,66,71],33),
    'Fsm7': ([49,52,57,61,64],42), 'B7': ([47,51,57,61,66],35),
    'G9': ([43,54,57,62,66],43), 'Gm6': ([43,50,55,58,64],43),
}
A = ['D9','Bm9','Em9','A13','Fsm7','B7','Em9','A13']
B = ['G9','Gm6','D9','Fsm7','Em9','A13','D9','A13']
sequence = A+A+B+A
melody_a = [
    [(0,69,.5),(1.25,66,.5),(2,64,.5),(3,62,.65)],
    [(.5,66,.5),(1.5,69,.5),(2.5,73,.65),(3.5,71,.35)],
    [(.5,67,.4),(1.5,66,.4),(2.25,62,.5),(3.25,64,.4)],
    [(0,73,.65),(1,71,.4),(2,66,.6),(3,69,.55)],
    [(.25,66,.5),(1.25,64,.4),(2.5,61,.5),(3.25,64,.4)],
    [(.5,63,.5),(1.5,66,.4),(2.5,69,.4),(3.25,73,.45)],
    [(0,71,.6),(1.25,67,.5),(2.25,66,.4),(3.25,64,.4)],
    [(.25,73,.5),(1.25,71,.45),(2.25,69,.55)],
]
melody_b = [
    [(0,71,.7),(1.5,69,.4),(2.5,67,.5),(3.25,66,.4)],
    [(.25,70,.6),(1.5,69,.4),(2.5,67,.5),(3.5,64,.35)],
    [(0,66,.75),(1.5,64,.4),(2.5,62,.7)],
    [(.5,61,.5),(1.5,64,.5),(2.5,66,.8)],
    [(.25,67,.5),(1.25,71,.5),(2.5,74,.8)],
    [(0,73,.65),(1.25,71,.5),(2.5,69,.6)],
    [(.25,66,.5),(1.5,64,.5),(2.5,62,1)],
    [(.5,64,.5),(1.5,66,.4),(2.5,69,.6)],
]
for bar, chord_name in enumerate(sequence):
    notes, root = chords[chord_name]
    time = bar * 4 * BEAT
    # Soft bossa comp, with two sections of slightly different voicing and density.
    for position, duration, accent in [(0,1.1,.7),(1.75,.65,1),(3,.75,.85)]:
        for voice,midi in enumerate(notes):
            add(note(midi,duration*BEAT,'keys'),time+position*BEAT+voice*.007,.042*accent*rng.uniform(.94,1.06),-.2)
    for beat in [.5,1.5,2.5,3.5]:
        midi=notes[(int(beat*2)+bar)%len(notes)]+12
        add(note(midi,.5*BEAT,'pluck'),time+beat*BEAT,.036,.35)
    # Root/fifth/approach line makes it a score with forward motion, not a drone.
    next_root=chords[sequence[(bar+1)%BARS]][1]
    for position,midi,duration,gain in [(0,root,1.2,.15),(1.5,root+7,.4,.09),(2.25,root+12,.55,.10),(3.25,next_root-1,.5,.085)]:
        add(note(midi,duration*BEAT,'bass'),time+position*BEAT,gain,0)
    if bar>=4:
        for midi in notes[1:4]:add(note(midi+12,3.6*BEAT,'pad'),time,.010,(-1 if midi%2 else 1)*.55)
    phrase = melody_b if 16<=bar<24 else melody_a
    if bar>=2:
        for position,midi,duration in phrase[bar%8]:
            # Small response variation on the last A section.
            if bar>=24 and position<1 and bar%2==0:midi+=12
            add(note(midi,duration*BEAT,'vibes'),time+position*BEAT+rng.uniform(-.006,.006),.10 if bar<24 else .085,.1)
    for position in [0,2.5]:add(kick(),time+position*BEAT,.085)
    for position in [1,3]:add(rim(),time+position*BEAT,.037,-.23)
    for i in range(8):add(tick(),time+(i*.5+(.04 if i%2 else 0))*BEAT,.014 if i%2 else .009,.3)
    if bar%8==7:
        for position in [3.25,3.5,3.75]:add(rim(),time+position*BEAT,.018,-.1)

# Circular room reflections preserve the musical tail across the loop boundary.
dry=mix.copy()
for seconds,gain,swap in [(.037,.10,False),(.073,.08,True),(.131,.07,False),(.211,.055,True),(.337,.038,False),(.493,.024,True)]:
    echo=np.roll(dry,round(seconds*SR),axis=0)
    mix+=echo[:,::-1] * gain if swap else echo*gain
mix-=mix.mean(axis=0)
mix=np.tanh(mix*.9)
mix*=.83/max(np.max(np.abs(mix)),1e-9)
out=Path('work/audio');out.mkdir(parents=True,exist_ok=True)
master=out/'rooftop-daylight-master.wav'
with wave.open(str(master),'wb') as wav:
    wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(SR)
    wav.writeframes((mix*32767).astype('<i2').tobytes())
metadata={'title':'Rooftop Daylight','composition':'Original commissioned instrumental; no third-party recordings or samples','bpm':BPM,'key':'D major','bars':BARS,'seconds':N/SR,'sample_rate':SR,'channels':2,'peak':float(np.max(np.abs(mix))),'rms':float(np.sqrt(np.mean(mix**2))),'instruments':['electric keys','plucked strings','vibraphone','bass','soft kick','woodblock','metal tick']}
(out/'composition.json').write_text(json.dumps(metadata,indent=2))
print(json.dumps(metadata,indent=2))

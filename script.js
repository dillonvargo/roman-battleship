class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.5;
        this._loadPreferences();
    }

    _loadPreferences() {
        try {
            const saved = localStorage.getItem('soundSettings');
            if (saved) {
                const prefs = JSON.parse(saved);
                if (typeof prefs.enabled === 'boolean') this.enabled = prefs.enabled;
                if (typeof prefs.volume === 'number') this.volume = prefs.volume;
            }
        } catch (e) { /* ignore */ }
    }

    _savePreferences() {
        try {
            localStorage.setItem('soundSettings', JSON.stringify({
                enabled: this.enabled,
                volume: this.volume
            }));
        } catch (e) { /* ignore */ }
    }

    setEnabled(on) {
        this.enabled = on;
        this._savePreferences();
    }

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        this._savePreferences();
    }

    _ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    _createGain(vol) {
        const ctx = this._ensureContext();
        const g = ctx.createGain();
        g.gain.value = (vol || 1) * this.volume;
        g.connect(ctx.destination);
        return g;
    }

    _createNoise(duration) {
        const ctx = this._ensureContext();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        return source;
    }

    // Low-tone keyboard click — hover tile
    tick() {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        const t = ctx.currentTime;

        // Low mechanical click
        const g = this._createGain(0.18);
        g.gain.setValueAtTime(0.18 * this.volume, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.04);
        osc.connect(g);
        osc.start(t);
        osc.stop(t + 0.04);

        // Tiny noise transient for tactile feel
        const ng = this._createGain(0.06);
        ng.gain.setValueAtTime(0.06 * this.volume, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        const noise = this._createNoise(0.02);
        noise.connect(ng);
        noise.start(t);
        noise.stop(t + 0.02);
    }

    // Stronger bronze click — select tile
    click() {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        const t = ctx.currentTime;
        const g = this._createGain(0.3);
        g.gain.setValueAtTime(0.3 * this.volume, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
        osc.connect(g);
        osc.start(t);
        osc.stop(t + 0.1);

        // Harmonic layer
        const g2 = this._createGain(0.15);
        g2.gain.setValueAtTime(0.15 * this.volume, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(4400, t);
        osc2.frequency.exponentialRampToValueAtTime(2000, t + 0.08);
        osc2.connect(g2);
        osc2.start(t);
        osc2.stop(t + 0.08);
    }

    // Short drum hit — confirm attack
    drumHit() {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        const t = ctx.currentTime;

        // Low thump
        const g = this._createGain(0.5);
        g.gain.setValueAtTime(0.5 * this.volume, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);
        osc.connect(g);
        osc.start(t);
        osc.stop(t + 0.2);

        // Noise snap
        const ng = this._createGain(0.3);
        ng.gain.setValueAtTime(0.3 * this.volume, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        const noise = this._createNoise(0.08);
        noise.connect(ng);
        noise.start(t);
        noise.stop(t + 0.08);
    }

    // Water drop — miss
    splash() {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        const t = ctx.currentTime;

        // High-pitched "plip" drop
        const g = this._createGain(0.35);
        g.gain.setValueAtTime(0.35 * this.volume, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
        osc.connect(g);
        osc.start(t);
        osc.stop(t + 0.15);

        // Subtle ripple resonance
        const g2 = this._createGain(0.12);
        g2.gain.setValueAtTime(0.001, t + 0.05);
        g2.gain.linearRampToValueAtTime(0.12 * this.volume, t + 0.08);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(800, t + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(400, t + 0.3);
        osc2.connect(g2);
        osc2.start(t + 0.05);
        osc2.stop(t + 0.3);
    }

    // Cannon boom — hit
    hit() {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        const t = ctx.currentTime;

        // Deep cannon thump
        const g = this._createGain(0.55);
        g.gain.setValueAtTime(0.55 * this.volume, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
        osc.connect(g);
        osc.start(t);
        osc.stop(t + 0.35);

        // Explosion burst — bandpass noise
        const g2 = this._createGain(0.4);
        g2.gain.setValueAtTime(0.4 * this.volume, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        const bpFilter = ctx.createBiquadFilter();
        bpFilter.type = 'bandpass';
        bpFilter.frequency.setValueAtTime(800, t);
        bpFilter.frequency.exponentialRampToValueAtTime(200, t + 0.2);
        bpFilter.Q.value = 0.8;
        bpFilter.connect(g2);
        const noise = this._createNoise(0.2);
        noise.connect(bpFilter);
        noise.start(t);
        noise.stop(t + 0.2);

        // High crack transient
        const g3 = this._createGain(0.2);
        g3.gain.setValueAtTime(0.2 * this.volume, t);
        g3.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        const crack = this._createNoise(0.05);
        crack.connect(g3);
        crack.start(t);
        crack.stop(t + 0.05);
    }

    // Conch shell blow — sunk
    sunk() {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        const t = ctx.currentTime;

        // Main conch tone — sine with slow attack/release
        const g1 = this._createGain(0.35);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.35 * this.volume, t + 0.3);
        g1.gain.setValueAtTime(0.35 * this.volume, t + 0.8);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
        const shell = ctx.createOscillator();
        shell.type = 'sine';
        shell.frequency.setValueAtTime(180, t);
        shell.frequency.linearRampToValueAtTime(220, t + 0.6);
        shell.frequency.linearRampToValueAtTime(190, t + 1.4);
        shell.connect(g1);
        shell.start(t);
        shell.stop(t + 1.4);

        // Harmonic overtone — triangle for hollow resonance
        const g2 = this._createGain(0.2);
        g2.gain.setValueAtTime(0.001, t);
        g2.gain.linearRampToValueAtTime(0.2 * this.volume, t + 0.35);
        g2.gain.setValueAtTime(0.2 * this.volume, t + 0.75);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
        const overtone = ctx.createOscillator();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(360, t);
        overtone.frequency.linearRampToValueAtTime(440, t + 0.6);
        overtone.frequency.linearRampToValueAtTime(380, t + 1.3);
        overtone.connect(g2);
        overtone.start(t);
        overtone.stop(t + 1.3);

        // Breath texture — filtered noise
        const g3 = this._createGain(0.12);
        g3.gain.setValueAtTime(0.001, t);
        g3.gain.linearRampToValueAtTime(0.12 * this.volume, t + 0.25);
        g3.gain.setValueAtTime(0.12 * this.volume, t + 0.7);
        g3.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        const breathFilter = ctx.createBiquadFilter();
        breathFilter.type = 'bandpass';
        breathFilter.frequency.setValueAtTime(400, t);
        breathFilter.frequency.linearRampToValueAtTime(600, t + 0.6);
        breathFilter.frequency.linearRampToValueAtTime(350, t + 1.2);
        breathFilter.Q.value = 2;
        breathFilter.connect(g3);
        const breath = this._createNoise(1.2);
        breath.connect(breathFilter);
        breath.start(t);
        breath.stop(t + 1.2);
    }

    // Roman triumph horn + crowd cheer — victory
    victory() {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        const t = ctx.currentTime;

        // Ascending triumph horn notes
        const notes = [220, 277, 330, 440];
        notes.forEach((freq, i) => {
            const start = t + i * 0.25;
            const g = this._createGain(0.3);
            g.gain.setValueAtTime(0.001, start);
            g.gain.linearRampToValueAtTime(0.3 * this.volume, start + 0.05);
            g.gain.setValueAtTime(0.3 * this.volume, start + 0.2);
            g.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            osc.connect(g);
            osc.start(start);
            osc.stop(start + 0.25);
        });

        // Final sustained note
        const gFinal = this._createGain(0.35);
        const fStart = t + 1.0;
        gFinal.gain.setValueAtTime(0.001, fStart);
        gFinal.gain.linearRampToValueAtTime(0.35 * this.volume, fStart + 0.1);
        gFinal.gain.setValueAtTime(0.35 * this.volume, fStart + 0.6);
        gFinal.gain.exponentialRampToValueAtTime(0.001, fStart + 1.2);
        const finalOsc = ctx.createOscillator();
        finalOsc.type = 'sawtooth';
        finalOsc.frequency.value = 440;
        finalOsc.connect(gFinal);
        finalOsc.start(fStart);
        finalOsc.stop(fStart + 1.2);

        // Crowd cheer — filtered noise layer
        const gCheer = this._createGain(0.2);
        gCheer.gain.setValueAtTime(0.001, t + 0.5);
        gCheer.gain.linearRampToValueAtTime(0.2 * this.volume, t + 0.8);
        gCheer.gain.setValueAtTime(0.2 * this.volume, t + 1.5);
        gCheer.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
        const cheerFilter = ctx.createBiquadFilter();
        cheerFilter.type = 'bandpass';
        cheerFilter.frequency.value = 1200;
        cheerFilter.Q.value = 0.5;
        cheerFilter.connect(gCheer);
        const cheerNoise = this._createNoise(2.2);
        cheerNoise.connect(cheerFilter);
        cheerNoise.start(t + 0.5);
        cheerNoise.stop(t + 2.2);
    }

    // Low horn + fading waves — defeat
    defeat() {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        const t = ctx.currentTime;

        // Low descending horn
        const g1 = this._createGain(0.35);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.35 * this.volume, t + 0.15);
        g1.gain.setValueAtTime(0.35 * this.volume, t + 1.0);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
        const horn = ctx.createOscillator();
        horn.type = 'sawtooth';
        horn.frequency.setValueAtTime(180, t);
        horn.frequency.linearRampToValueAtTime(80, t + 2.0);
        horn.connect(g1);
        horn.start(t);
        horn.stop(t + 2.0);

        // Fading waves — slow noise fade
        const g2 = this._createGain(0.2);
        g2.gain.setValueAtTime(0.2 * this.volume, t);
        g2.gain.linearRampToValueAtTime(0.15 * this.volume, t + 1.0);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
        const waveFilter = ctx.createBiquadFilter();
        waveFilter.type = 'lowpass';
        waveFilter.frequency.setValueAtTime(800, t);
        waveFilter.frequency.exponentialRampToValueAtTime(100, t + 2.5);
        waveFilter.connect(g2);
        const waveNoise = this._createNoise(2.5);
        waveNoise.connect(waveFilter);
        waveNoise.start(t);
        waveNoise.stop(t + 2.5);
    }
}

class Ship {
    constructor(shipClass, size) {
        this.shipClass = shipClass;
        this.size = size;
        this.maxHealth = size;
        this.currentHealth = size;
        this.isSunk = false;
        this.occupiedCells = [];
        this.orientation = 'horizontal';
        this.romanName = this.getRomanName(shipClass);
    }
    
    getRomanName(shipClass) {
        const romanMapping = {
            'carrier': 'Quinquereme',
            'battleship': 'Quadrireme',
            'destroyer': 'Trireme',
            'submarine': 'Trireme',
            'patrol': 'Bireme'
        };
        return romanMapping[shipClass] || shipClass;
    }
    
    setOccupiedCells(cells, orientation) {
        this.occupiedCells = cells.map(([row, col]) => ({ row, col }));
        if (orientation) this.orientation = orientation;
    }
    
    hit() {
        // Prevent further damage to destroyed vessels
        if (this.isSunk) {
            console.log(`${this.romanName} already destroyed - hull breached`);
            return false;
        }
        
        this.currentHealth--;
        console.log(`${this.romanName} rammed! Hull integrity: ${this.currentHealth}/${this.maxHealth}`);
        
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.isSunk = true;
            console.log(`${this.romanName} destroyed - vessel sinking!`);
        }
        
        return true;
    }
    
    getStatus() {
        return {
            shipClass: this.shipClass,
            romanName: this.romanName,
            size: this.size,
            currentHealth: this.currentHealth,
            maxHealth: this.maxHealth,
            isSunk: this.isSunk,
            occupiedCells: this.occupiedCells
        };
    }
}

class BattleshipGrid {
    constructor() {
        this.COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        this.ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.GRID_SIZE = 10;
    }
    
    coordinateToIndices(coordinate) {
        if (typeof coordinate !== 'string') {
            throw new Error('Invalid coordinate: must be a string');
        }
        
        const match = coordinate.match(/^([A-J])(\d+)$/);
        if (!match) {
            throw new Error(`Invalid coordinate format: ${coordinate}`);
        }
        
        const col = match[1];
        const row = parseInt(match[2], 10);
        
        if (!this.COLUMNS.includes(col)) {
            throw new Error(`Invalid column: ${col}. Must be A-J`);
        }
        
        if (!this.ROWS.includes(row)) {
            throw new Error(`Invalid row: ${row}. Must be 1-10`);
        }
        
        const colIndex = this.COLUMNS.indexOf(col);
        const rowIndex = row - 1;
        
        return { row: rowIndex, col: colIndex };
    }
    
    indicesToCoordinate(row, col) {
        if (row < 0 || row >= this.GRID_SIZE) {
            throw new Error(`Invalid row index: ${row}. Must be 0-9`);
        }
        
        if (col < 0 || col >= this.GRID_SIZE) {
            throw new Error(`Invalid column index: ${col}. Must be 0-9`);
        }
        
        return `${this.COLUMNS[col]}${this.ROWS[row]}`;
    }
    
    isValidCoordinate(coordinate) {
        try {
            this.coordinateToIndices(coordinate);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    isValidIndices(row, col) {
        return row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE;
    }
}

class BattleshipGame {
    constructor() {
        this.grid = new BattleshipGrid();
        this.boardSize = 10;
        
        this.playerFleet = this.createFleet();
        this.computerFleet = this.createFleet();
        
        this.playerBoard = this.createEmptyBoard();
        this.computerBoard = this.createEmptyBoard();
        this.playerShots = this.createEmptyBoard();
        this.computerShots = this.createEmptyBoard();
        
        this.currentShip = null;
        this.draggedShip = null;
        this.orientation = 'horizontal';
        this.placementConfirmed = false;
        this.gameStarted = false;
        this.currentTurn = 'player';
        this.turnLocked = false;
        this.playerHits = 0;
        this.computerHits = 0;
        this.totalTurns = 0;
        this.playerTotalShots = 0;
        
        this.sound = new SoundManager();
        
        this.initializeEventListeners();
        this.createBoards();
        this.initSoundSettings();
    }
    
    createFleet() {
        return {
            carrier: new Ship('carrier', 5),
            battleship: new Ship('battleship', 4),
            destroyer: new Ship('destroyer', 3),
            submarine: new Ship('submarine', 3),
            patrol: new Ship('patrol', 2)
        };
    }
    
    createEmptyBoard() {
        return Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
    }
    
    initSoundSettings() {
        const toggle = document.getElementById('sound-toggle');
        const slider = document.getElementById('volume-slider');
        const volLabel = document.getElementById('volume-value');
        
        if (toggle) {
            toggle.checked = this.sound.enabled;
            toggle.addEventListener('change', () => {
                this.sound.setEnabled(toggle.checked);
            });
        }
        
        if (slider) {
            slider.value = Math.round(this.sound.volume * 100);
            if (volLabel) volLabel.textContent = slider.value + '%';
            slider.addEventListener('input', () => {
                this.sound.setVolume(parseInt(slider.value) / 100);
                if (volLabel) volLabel.textContent = slider.value + '%';
            });
        }
    }
    
    initializeEventListeners() {
        document.querySelectorAll('.ship').forEach(ship => {
            ship.addEventListener('dragstart', (e) => this.handleDragStart(e));
            ship.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
        
        document.querySelectorAll('input[name="orientation"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.orientation = e.target.value;
            });
        });
        
        document.querySelectorAll('.edit-ship-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeShip(btn.dataset.ship);
            });
        });
        
        document.getElementById('confirm-placement').addEventListener('click', () => this.confirmPlacement());
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        document.getElementById('mid-game-restart').addEventListener('click', () => this.handleMidGameRestart());
        document.getElementById('mid-game-home').addEventListener('click', () => this.handleMidGameHome());
    }
    
    createBoards() {
        const setupBoardEl = document.getElementById('setup-board');
        const playerBoardEl = document.getElementById('player-board');
        const computerBoardEl = document.getElementById('computer-board');
        
        if (setupBoardEl) {
            setupBoardEl.innerHTML = '';
            this.createSetupBoard(setupBoardEl);
        }
        
        playerBoardEl.innerHTML = '';
        computerBoardEl.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const coordinate = this.grid.indicesToCoordinate(row, col);
                
                const playerCell = document.createElement('div');
                playerCell.className = 'cell';
                playerCell.dataset.row = row;
                playerCell.dataset.col = col;
                playerCell.dataset.coordinate = coordinate;
                playerCell.title = coordinate;
                playerBoardEl.appendChild(playerCell);
                
                const computerCell = document.createElement('div');
                computerCell.className = 'cell';
                computerCell.dataset.row = row;
                computerCell.dataset.col = col;
                computerCell.dataset.coordinate = coordinate;
                computerCell.title = coordinate;
                computerCell.addEventListener('click', (e) => this.handleComputerBoardClick(e));
                computerCell.addEventListener('mouseenter', () => this.sound.tick());
                computerBoardEl.appendChild(computerCell);
            }
        }
    }
    
    createSetupBoard(boardEl) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const coordinate = this.grid.indicesToCoordinate(row, col);
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.coordinate = coordinate;
                cell.title = coordinate;
                
                cell.addEventListener('dragover', (e) => this.handleDragOver(e));
                cell.addEventListener('dragleave', (e) => this.handleDragLeave(e));
                cell.addEventListener('drop', (e) => this.handleDrop(e));
                
                boardEl.appendChild(cell);
            }
        }
    }
    
    handleDragStart(e) {
        if (this.placementConfirmed) return;
        
        const shipEl = e.target.closest('.ship');
        if (!shipEl) return;
        
        const shipType = shipEl.dataset.ship;
        if (this.playerFleet[shipType].occupiedCells.length > 0) {
            e.preventDefault();
            return;
        }
        
        this.draggedShip = shipType;
        shipEl.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        
        // Create custom drag image with only the ship SVG
        const img = shipEl.querySelector('img');
        if (img) {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-1000px';
            container.style.left = '-1000px';
            container.style.opacity = '0.8';
            
            const dragImage = img.cloneNode(true);
            
            // Apply orientation-specific styling
            if (this.orientation === 'vertical') {
                container.style.width = '50px';
                container.style.height = '150px';
                dragImage.style.width = '150px';
                dragImage.style.height = 'auto';
                dragImage.style.transform = 'rotate(90deg) translateY(-50px)';
                dragImage.style.transformOrigin = 'left top';
                container.appendChild(dragImage);
                document.body.appendChild(container);
                e.dataTransfer.setDragImage(container, 25, 75);
            } else {
                container.style.width = '150px';
                container.style.height = '50px';
                dragImage.style.width = '150px';
                dragImage.style.height = 'auto';
                container.appendChild(dragImage);
                document.body.appendChild(container);
                e.dataTransfer.setDragImage(container, 75, 25);
            }
            
            setTimeout(() => document.body.removeChild(container), 0);
        }
        
        this.updateStatusMessage(`Dragging ${this.playerFleet[shipType].romanName} - drop on grid to place`);
    }
    
    handleDragEnd(e) {
        const shipEl = e.target.closest('.ship');
        if (shipEl) {
            shipEl.classList.remove('dragging');
        }
        this.clearPreview();
    }
    
    handleDragOver(e) {
        if (!this.draggedShip || this.placementConfirmed) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (isNaN(row) || isNaN(col)) return;
        
        this.showDragPreview(row, col);
    }
    
    handleDragLeave(e) {
        if (!this.draggedShip) return;
        this.clearPreview();
    }
    
    handleDrop(e) {
        if (!this.draggedShip || this.placementConfirmed) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const cell = e.target.closest('.cell');
        if (!cell) {
            this.draggedShip = null;
            return;
        }
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (isNaN(row) || isNaN(col)) {
            this.draggedShip = null;
            return;
        }
        
        const ship = this.playerFleet[this.draggedShip];
        const positions = this.getShipPositions(row, col, ship.size, this.orientation);
        
        if (this.isValidPlacement(positions)) {
            this.placeShip(this.playerBoard, positions, this.draggedShip, this.playerFleet, this.orientation);
            
            positions.forEach(([r, c], index) => {
                const cell = document.querySelector(`#setup-board .cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.add('ship');
                    cell.classList.add(this.orientation);
                    this.renderShipImage(cell, this.draggedShip, this.orientation, index, ship.size);
                }
            });
            
            const shipEl = document.querySelector(`.ship[data-ship="${this.draggedShip}"]`);
            shipEl.classList.add('placed');
            const editBtn = shipEl.querySelector('.edit-ship-btn');
            if (editBtn) editBtn.style.display = '';
            
            this.updateStatusMessage(`${ship.romanName} placed successfully!`, 'success');
            this.updateShipsRemaining();
            this.checkAllShipsPlaced();
        } else {
            const message = this.getPlacementValidationMessage(positions);
            this.updateStatusMessage(message, 'error');
        }
        
        this.draggedShip = null;
        this.clearPreview();
    }
    
    showDragPreview(row, col) {
        this.clearPreview();
        
        if (!this.draggedShip) return;
        
        const ship = this.playerFleet[this.draggedShip];
        const positions = this.getShipPositions(row, col, ship.size, this.orientation);
        
        if (this.isValidPlacement(positions)) {
            positions.forEach(([r, c]) => {
                const cell = document.querySelector(`#setup-board .cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) cell.classList.add('preview');
            });
        } else {
            positions.forEach(([r, c]) => {
                if (this.grid.isValidIndices(r, c)) {
                    const cell = document.querySelector(`#setup-board .cell[data-row="${r}"][data-col="${c}"]`);
                    if (cell) cell.classList.add('invalid');
                }
            });
        }
    }
    
    selectShip(e) {
        if (this.placementConfirmed) return;
        
        const shipEl = e.currentTarget;
        const shipType = shipEl.dataset.ship;
        
        if (this.playerFleet[shipType].occupiedCells.length > 0) return;
        
        document.querySelectorAll('.ship').forEach(ship => ship.classList.remove('selected'));
        shipEl.classList.add('selected');
        this.currentShip = shipType;
        
        this.updateStatusMessage(`Place your ${this.playerFleet[shipType].romanName} (${this.playerFleet[shipType].size} cells)`);
    }
    
    handleCellHover(e) {
        if (!this.currentShip || this.gameStarted || this.placementConfirmed) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        this.showPreview(row, col);
    }
    
    showPreview(row, col) {
        this.clearPreview();
        
        if (!this.currentShip) return;
        
        const ship = this.playerFleet[this.currentShip];
        const positions = this.getShipPositions(row, col, ship.size, this.orientation);
        
        if (this.isValidPlacement(positions)) {
            positions.forEach(([r, c]) => {
                const cell = document.querySelector(`#player-board .cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) cell.classList.add('preview');
            });
        } else {
            positions.forEach(([r, c]) => {
                if (this.grid.isValidIndices(r, c)) {
                    const cell = document.querySelector(`#player-board .cell[data-row="${r}"][data-col="${c}"]`);
                    if (cell) cell.classList.add('invalid');
                }
            });
        }
    }
    
    clearPreview() {
        document.querySelectorAll('.preview, .invalid').forEach(cell => {
            cell.classList.remove('preview', 'invalid');
        });
    }
    
    updatePreview() {
        if (!this.currentShip) return;
        
        const hoveredCell = document.querySelector('#player-board .cell:hover');
        if (hoveredCell) {
            const row = parseInt(hoveredCell.dataset.row);
            const col = parseInt(hoveredCell.dataset.col);
            this.showPreview(row, col);
        }
    }
    
    getShipPositions(row, col, length, orientation) {
        const positions = [];
        for (let i = 0; i < length; i++) {
            if (orientation === 'horizontal') {
                positions.push([row, col + i]);
            } else {
                positions.push([row + i, col]);
            }
        }
        return positions;
    }
    
    hasAdjacentShip(board, positions) {
        const posSet = new Set(positions.map(([r, c]) => `${r},${c}`));
        for (const [row, col] of positions) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = row + dr;
                    const nc = col + dc;
                    if (!this.grid.isValidIndices(nr, nc)) continue;
                    if (posSet.has(`${nr},${nc}`)) continue;
                    if (board[nr][nc] !== null) return true;
                }
            }
        }
        return false;
    }
    
    isValidPlacement(positions) {
        for (const [row, col] of positions) {
            if (!this.grid.isValidIndices(row, col)) {
                return false;
            }
            if (this.playerBoard[row][col] !== null) {
                return false;
            }
        }
        if (this.hasAdjacentShip(this.playerBoard, positions)) {
            return false;
        }
        return true;
    }
    
    getPlacementValidationMessage(positions) {
        for (const [row, col] of positions) {
            if (!this.grid.isValidIndices(row, col)) {
                return 'Ship extends outside grid boundaries';
            }
            if (this.playerBoard[row][col] !== null) {
                return 'Ship overlaps with another ship';
            }
        }
        if (this.hasAdjacentShip(this.playerBoard, positions)) {
            return 'Ship too close to another vessel';
        }
        return 'Valid placement';
    }
    
    handlePlayerBoardClick(e) {
        if (!this.currentShip || this.gameStarted || this.placementConfirmed) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const ship = this.playerFleet[this.currentShip];
        const positions = this.getShipPositions(row, col, ship.size, this.orientation);
        
        if (!this.isValidPlacement(positions)) {
            const message = this.getPlacementValidationMessage(positions);
            this.updateStatusMessage(message, 'error');
            this.showInvalidPlacementFeedback(positions);
            return;
        }
        
        this.placeShip(this.playerBoard, positions, this.currentShip, this.playerFleet, this.orientation);
        positions.forEach(([r, c], index) => {
            const cell = document.querySelector(`#player-board .cell[data-row="${r}"][data-col="${c}"]`);
            cell.classList.add('ship');
            cell.classList.add(this.orientation);
            this.renderShipImage(cell, this.currentShip, this.orientation, index, ship.size);
        });
        
        const shipEl = document.querySelector(`.ship[data-ship="${this.currentShip}"]`);
        shipEl.classList.add('placed');
        shipEl.classList.remove('selected');
        const editBtn = shipEl.querySelector('.edit-ship-btn');
        if (editBtn) editBtn.style.display = '';
        
        this.updateStatusMessage(`${ship.romanName} placed successfully!`, 'success');
        this.currentShip = null;
        this.clearPreview();
        this.updateShipsRemaining();
        this.checkAllShipsPlaced();
    }
    
    showInvalidPlacementFeedback(positions) {
        positions.forEach(([r, c]) => {
            if (this.grid.isValidIndices(r, c)) {
                const cell = document.querySelector(`#player-board .cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.add('invalid');
                    setTimeout(() => cell.classList.remove('invalid'), 500);
                }
            }
        });
    }
    
    placeShip(board, positions, shipType, fleet, orientation) {
        positions.forEach(([row, col]) => {
            board[row][col] = shipType;
        });
        fleet[shipType].setOccupiedCells(positions, orientation);
    }
    
    removeShip(shipType) {
        if (this.placementConfirmed) return;
        
        const ship = this.playerFleet[shipType];
        if (ship.occupiedCells.length === 0) return;
        
        // Clear from board data
        ship.occupiedCells.forEach(({ row, col }) => {
            this.playerBoard[row][col] = null;
            
            // Clear setup board cell visuals
            const cell = document.querySelector(`#setup-board .cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.remove('ship', 'horizontal', 'vertical');
                const img = cell.querySelector('.ship-image');
                if (img) img.remove();
            }
        });
        
        // Reset ship data
        ship.occupiedCells = [];
        
        // Re-enable the ship element for dragging
        const shipEl = document.querySelector(`.ship[data-ship="${shipType}"]`);
        if (shipEl) {
            shipEl.classList.remove('placed');
            shipEl.style.opacity = '';
            shipEl.style.cursor = '';
        }
        
        // Hide edit button
        const editBtn = shipEl.querySelector('.edit-ship-btn');
        if (editBtn) editBtn.style.display = 'none';
        
        // Hide confirm/start buttons since not all ships are placed
        const confirmButton = document.getElementById('confirm-placement');
        if (confirmButton) {
            confirmButton.style.display = 'none';
            confirmButton.disabled = true;
        }
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.style.display = 'none';
            startButton.disabled = true;
        }
        
        this.updateShipsRemaining();
        this.updateStatusMessage(`${ship.romanName} removed. Drag it back onto the grid.`);
    }
    
    getSegmentType(segmentIndex, shipLength) {
        if (segmentIndex === 0) return 'bow';
        if (segmentIndex === shipLength - 1) return 'stern';
        // Alternate mid variants for visual variety
        return segmentIndex % 2 === 1 ? 'mid1' : 'mid2';
    }
    
    getSegmentSrc(shipType, segmentType, orientation, damageState = 'normal') {
        const vertSuffix = orientation === 'vertical' ? '-vertical' : '';
        return `ships/segments/${shipType}-${segmentType}-${damageState}${vertSuffix}.svg`;
    }
    
    renderShipImage(cell, shipType, orientation, segmentIndex, shipLength) {
        const segmentType = this.getSegmentType(segmentIndex, shipLength);
        const src = this.getSegmentSrc(shipType, segmentType, orientation, 'normal');
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${shipType} ${segmentType}`;
        img.className = 'ship-image';
        img.dataset.shipType = shipType;
        img.dataset.segmentType = segmentType;
        img.dataset.damageState = 'normal';
        img.dataset.orientation = orientation;
        cell.appendChild(img);
    }
    
    updateCellDamageState(cell, newState) {
        const img = cell.querySelector('.ship-image');
        if (!img) return;
        
        const shipType = img.dataset.shipType;
        const segmentType = img.dataset.segmentType;
        const orientation = img.dataset.orientation;
        
        img.dataset.damageState = newState;
        img.src = this.getSegmentSrc(shipType, segmentType, orientation, newState);
    }
    
    updateStatusMessage(message, type = 'info') {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = type === 'error' ? '#8b3a3a' : 
                                   type === 'success' ? '#2d5016' : '#8b4513';
        }
    }
    
    updateShipsRemaining() {
        const placed = Object.values(this.playerFleet).filter(ship => ship.occupiedCells.length > 0).length;
        const remaining = 5 - placed;
        const countEl = document.getElementById('remaining-count');
        if (countEl) {
            countEl.textContent = remaining;
        }
        
        if (remaining === 0) {
            this.updateStatusMessage('All ships placed! Ready to start battle.', 'success');
        } else if (remaining > 0 && !this.currentShip) {
            this.updateStatusMessage('Select a ship to continue placement');
        }
    }
    
    checkAllShipsPlaced() {
        const allPlaced = Object.values(this.playerFleet).every(ship => ship.occupiedCells.length > 0);
        const confirmButton = document.getElementById('confirm-placement');
        
        if (confirmButton) {
            confirmButton.disabled = !allPlaced;
            if (allPlaced && !this.placementConfirmed) {
                confirmButton.style.display = 'block';
                confirmButton.style.opacity = '1';
                confirmButton.style.cursor = 'pointer';
            }
        }
    }
    
    confirmPlacement() {
        const allPlaced = Object.values(this.playerFleet).every(ship => ship.occupiedCells.length > 0);
        if (!allPlaced || this.placementConfirmed) return;
        
        this.placementConfirmed = true;
        
        this.currentShip = null;
        this.clearPreview();
        
        document.querySelectorAll('.edit-ship-btn').forEach(btn => btn.style.display = 'none');
        
        document.querySelectorAll('.ship').forEach(ship => {
            ship.style.opacity = '0.5';
            ship.style.cursor = 'not-allowed';
        });
        
        document.querySelectorAll('input[name="orientation"]').forEach(radio => {
            radio.disabled = true;
        });
        
        const confirmButton = document.getElementById('confirm-placement');
        if (confirmButton) {
            confirmButton.style.display = 'none';
        }
        
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.style.display = 'block';
            startButton.disabled = false;
            startButton.style.opacity = '1';
        }
        
        this.updateStatusMessage('Placement confirmed! Ships are locked. Ready for battle!', 'success');
        
        const placementStatus = document.getElementById('placement-status');
        if (placementStatus) {
            placementStatus.style.background = 'rgba(45, 80, 22, 0.1)';
            placementStatus.style.borderColor = '#2d5016';
        }
    }
    
    startGame() {
        if (!this.placementConfirmed) {
            this.updateStatusMessage('Please confirm your ship placement first!', 'error');
            return;
        }
        
        this.gameStarted = true;
        this.placeComputerShips();
        
        this.copyShipsToPlayerBoard();
        
        document.getElementById('game-setup').style.display = 'none';
        document.getElementById('game-boards').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    copyShipsToPlayerBoard() {
        Object.keys(this.playerFleet).forEach(shipType => {
            const ship = this.playerFleet[shipType];
            if (ship.occupiedCells.length > 0) {
                const firstCell = ship.occupiedCells[0];
                const secondCell = ship.occupiedCells[1];
                const orientation = secondCell && firstCell.row === secondCell.row ? 'horizontal' : 'vertical';
                
                ship.occupiedCells.forEach((cell, index) => {
                    const playerCell = document.querySelector(`#player-board .cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
                    if (playerCell) {
                        playerCell.classList.add('ship');
                        playerCell.classList.add(orientation);
                        this.renderShipImage(playerCell, shipType, orientation, index, ship.size);
                    }
                });
            }
        });
    }
    
    placeComputerShips() {
        const shipTypes = Object.keys(this.computerFleet);
        
        for (const shipType of shipTypes) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const row = Math.floor(Math.random() * this.boardSize);
                const col = Math.floor(Math.random() * this.boardSize);
                const positions = this.getShipPositions(row, col, this.computerFleet[shipType].size, orientation);
                
                if (this.isValidComputerPlacement(positions)) {
                    this.placeShip(this.computerBoard, positions, shipType, this.computerFleet, orientation);
                    placed = true;
                }
                attempts++;
            }
        }
    }
    
    isValidComputerPlacement(positions) {
        const valid = positions.every(([row, col]) => {
            if (!this.grid.isValidIndices(row, col)) {
                return false;
            }
            return this.computerBoard[row][col] === null;
        });
        if (!valid) return false;
        return !this.hasAdjacentShip(this.computerBoard, positions);
    }
    
    handleComputerBoardClick(e) {
        e.preventDefault();
        if (!this.gameStarted || this.currentTurn !== 'player' || this.turnLocked) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        // Prevent selecting already-attacked cells
        if (this.playerShots[row][col] !== null) return;
        
        // Lock turn and execute attack immediately
        this.sound.drumHit();
        this.turnLocked = true;
        this.makeAttack(row, col, 'player');
    }
    
    makeAttack(row, col, attacker) {
        const targetBoard = attacker === 'player' ? this.computerBoard : this.playerBoard;
        const targetFleet = attacker === 'player' ? this.computerFleet : this.playerFleet;
        const shotsBoard = attacker === 'player' ? this.playerShots : this.computerShots;
        
        shotsBoard[row][col] = true;
        
        // Track player shots for accuracy calculation
        if (attacker === 'player') {
            this.playerTotalShots++;
        }
        
        const shipType = targetBoard[row][col];
        const hit = shipType !== null;
        
        if (hit) {
            const ship = targetFleet[shipType];
            ship.hit();
        }
        
        if (attacker === 'player') {
            const cell = document.querySelector(`#computer-board .cell[data-row="${row}"][data-col="${col}"]`);
            if (hit) {
                cell.classList.add('hit');
                this.playHitCelebration(cell);
                this.playerHits++;
                document.getElementById('player-hits').textContent = this.playerHits;
                
                const ship = targetFleet[shipType];
                if (ship.isSunk) {
                    this.revealSunkShip(ship, 'computer-board');
                    this.playSunkCelebration(ship, 'computer-board');
                    this.displayAttackFeedback(`${ship.romanName} Destroyed!`, 'sunk');
                    this.sound.sunk();
                } else {
                    this.displayAttackFeedback('Ram Strike!', 'hit');
                    this.sound.hit();
                }
            } else {
                this.playSplashAnimation(cell, 'miss');
                this.displayAttackFeedback('Missed Waters', 'miss');
                this.sound.splash();
            }
        } else {
            const cell = document.querySelector(`#player-board .cell[data-row="${row}"][data-col="${col}"]`);
            if (hit) {
                cell.classList.add('computer-hit');
                this.updateCellDamageState(cell, 'hit');
                this.playHitCelebration(cell);
                this.computerHits++;
                document.getElementById('computer-hits').textContent = this.computerHits;
                
                const ship = targetFleet[shipType];
                if (ship.isSunk) {
                    this.revealSunkShip(ship, 'player-board');
                    this.playSunkCelebration(ship, 'player-board');
                    this.displayAttackFeedback(`Your ${ship.romanName} Destroyed!`, 'sunk');
                    this.sound.sunk();
                } else {
                    this.displayAttackFeedback('Enemy Ram Strike!', 'hit');
                    this.sound.hit();
                }
            } else {
                this.playSplashAnimation(cell, 'computer-miss');
                this.displayAttackFeedback('Enemy Missed', 'miss');
                this.sound.splash();
            }
        }
        
        if (this.checkWinCondition()) {
            this.endGame();
        } else {
            this.switchTurn();
        }
    }
    
    revealSunkShip(ship, boardId) {
        ship.occupiedCells.forEach((cell, index) => {
            const cellEl = document.querySelector(`#${boardId} .cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
            if (cellEl) {
                cellEl.classList.add('sunk');
                if (boardId === 'player-board') {
                    this.updateCellDamageState(cellEl, 'sunk');
                } else if (boardId === 'computer-board') {
                    this.renderShipImage(cellEl, ship.shipClass, ship.orientation, index, ship.size);
                    this.updateCellDamageState(cellEl, 'sunk');
                }
            }
        });
    }
    
    playSplashAnimation(cell, missClass) {
        cell.classList.add('miss-animating');

        // Second ripple ring
        const ring2 = document.createElement('div');
        ring2.className = 'splash-ring-2';
        cell.appendChild(ring2);

        // Water droplets
        const droplets = [];
        for (let i = 0; i < 4; i++) {
            const d = document.createElement('div');
            d.className = 'splash-droplet';
            d.style.left = (30 + Math.random() * 40) + '%';
            d.style.top = (20 + Math.random() * 30) + '%';
            d.style.animationDelay = (0.1 + Math.random() * 0.15) + 's';
            cell.appendChild(d);
            droplets.push(d);
        }

        // After animation completes, clean up and apply final miss state
        setTimeout(() => {
            cell.classList.remove('miss-animating');
            ring2.remove();
            droplets.forEach(d => d.remove());
            cell.classList.add(missClass);
        }, 650);
    }
    
    screenShake(heavy) {
        const boards = document.getElementById('game-boards');
        const cls = heavy ? 'screen-shake-heavy' : 'screen-shake';
        boards.classList.remove('screen-shake', 'screen-shake-heavy');
        void boards.offsetWidth;
        boards.classList.add(cls);
        setTimeout(() => boards.classList.remove(cls), heavy ? 400 : 200);
    }
    
    playHitCelebration(cell) {
        // Red flash
        cell.classList.add('hit-flash');
        setTimeout(() => cell.classList.remove('hit-flash'), 350);
        
        // Wood splinter particles
        const splinters = [];
        for (let i = 0; i < 5; i++) {
            const s = document.createElement('div');
            s.className = 'hit-splinter';
            const angle = (Math.PI * 2 / 5) * i + (Math.random() - 0.5) * 0.5;
            const dist = 20 + Math.random() * 15;
            s.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
            s.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
            s.style.setProperty('--sr', (Math.random() * 360) + 'deg');
            s.style.left = '50%';
            s.style.top = '50%';
            cell.appendChild(s);
            splinters.push(s);
        }
        setTimeout(() => splinters.forEach(s => s.remove()), 500);
        
        // Micro screen shake
        this.screenShake(false);
    }
    
    playSunkCelebration(ship, boardId) {
        // Heavy screen shake
        this.screenShake(true);
        
        // Dark ripple on surrounding tiles
        const rippleCells = new Set();
        ship.occupiedCells.forEach(({ row, col }) => {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr < 0 || nr >= this.boardSize || nc < 0 || nc >= this.boardSize) continue;
                    const key = `${nr},${nc}`;
                    // Skip cells that are part of the ship itself
                    const isShipCell = ship.occupiedCells.some(c => c.row === nr && c.col === nc);
                    if (!isShipCell && !rippleCells.has(key)) {
                        rippleCells.add(key);
                        const adj = document.querySelector(`#${boardId} .cell[data-row="${nr}"][data-col="${nc}"]`);
                        if (adj) {
                            adj.classList.add('sunk-ripple');
                            setTimeout(() => adj.classList.remove('sunk-ripple'), 700);
                        }
                    }
                }
            }
        });
    }
    
    displayAttackFeedback(message, type) {
        const feedbackEl = document.getElementById('attack-feedback');
        const titleEl = document.getElementById('banner-title');
        const subtextEl = document.getElementById('banner-subtext');
        
        const flavorText = {
            miss: [
                'Only sea.',
                'The waves take it.',
                'Wide of the mark.',
                'Neptune denies you.',
                'Lost to the deep.'
            ],
            hit: [
                'Hull struck!',
                'Oars shattered!',
                'They bleed seawater!',
                'Timber splits!',
                'A wound to their pride!'
            ],
            sunk: [
                'To Davy Jones!',
                'The sea claims another!',
                'Dragged to the depths!'
            ]
        };
        
        // Clear previous state
        if (this._bannerTimeout) clearTimeout(this._bannerTimeout);
        if (this._bannerFadeTimeout) clearTimeout(this._bannerFadeTimeout);
        feedbackEl.className = 'attack-feedback';
        feedbackEl.style.display = 'none';
        
        // Force reflow so animation restarts
        void feedbackEl.offsetWidth;
        
        // Set banner title
        let title = 'MISS';
        if (type === 'hit') title = 'HIT';
        else if (type === 'sunk') title = message;
        titleEl.textContent = title;
        
        // Set random subtext
        const pool = flavorText[type] || flavorText.miss;
        subtextEl.textContent = pool[Math.floor(Math.random() * pool.length)];
        
        // Show banner
        feedbackEl.classList.add(type);
        feedbackEl.style.display = 'block';
        
        // Fade out after 1.5s, then hide
        this._bannerFadeTimeout = setTimeout(() => {
            feedbackEl.classList.add('fading');
        }, 1500);
        
        this._bannerTimeout = setTimeout(() => {
            feedbackEl.style.display = 'none';
            feedbackEl.className = 'attack-feedback';
        }, 1900);
    }
    
    switchTurn() {
        this.currentTurn = this.currentTurn === 'player' ? 'computer' : 'player';
        this.turnLocked = false;
        
        // Track total turns (one complete round = player + computer)
        if (this.currentTurn === 'player') {
            this.totalTurns++;
        }
        
        document.getElementById('current-turn').textContent = 
            this.currentTurn === 'player' ? 'Your Command' : 'Enemy Maneuvers';
        
        if (this.currentTurn === 'computer') {
            setTimeout(() => this.computerAttack(), 1000);
        }
    }
    
    computerAttack() {
        if (this.currentTurn !== 'computer' || this.turnLocked) return;
        
        this.turnLocked = true;
        
        let row, col;
        let attempts = 0;
        
        do {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * this.boardSize);
            attempts++;
        } while (this.computerShots[row][col] !== null && attempts < 100);
        
        if (attempts < 100) {
            this.makeAttack(row, col, 'computer');
        }
    }
    
    checkWinCondition() {
        const playerWon = this.checkAllShipsSunk(this.computerFleet);
        const computerWon = this.checkAllShipsSunk(this.playerFleet);
        
        if (playerWon) {
            console.log('Victory! Enemy fleet destroyed!');
        } else if (computerWon) {
            console.log('Defeat! Your fleet destroyed!');
        }
        
        return playerWon || computerWon;
    }
    
    checkAllShipsSunk(fleet) {
        const allSunk = Object.values(fleet).every(ship => ship.isSunk);
        const sunkCount = Object.values(fleet).filter(ship => ship.isSunk).length;
        const totalShips = Object.values(fleet).length;
        
        console.log(`Fleet status: ${sunkCount}/${totalShips} vessels destroyed`);
        
        return allSunk;
    }
    
    spawnLaurelLeaves() {
        const container = document.getElementById('laurel-confetti');
        container.innerHTML = '';
        const leaves = ['🍃', '🌿', '🏆', '⚜️'];
        for (let i = 0; i < 22; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'laurel-leaf';
            leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
            leaf.style.left = (Math.random() * 100) + '%';
            leaf.style.animationDuration = (3 + Math.random() * 4) + 's';
            leaf.style.animationDelay = (Math.random() * 3) + 's';
            leaf.style.setProperty('--leaf-rot', (180 + Math.random() * 360) + 'deg');
            leaf.style.fontSize = (1 + Math.random() * 0.8) + 'rem';
            container.appendChild(leaf);
        }
    }
    
    endGame() {
        const playerWon = this.checkAllShipsSunk(this.computerFleet);
        
        // Count sunk ships
        const playerShipsSunk = Object.values(this.computerFleet).filter(ship => ship.isSunk).length;
        const computerShipsSunk = Object.values(this.playerFleet).filter(ship => ship.isSunk).length;
        
        // Calculate accuracy
        const accuracy = this.playerTotalShots > 0 
            ? Math.round((this.playerHits / this.playerTotalShots) * 100) 
            : 0;
        
        // Hide game boards and show end screen
        document.getElementById('game-boards').style.display = 'none';
        document.getElementById('game-over').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const gameOverEl = document.getElementById('game-over');
        const resultEl = document.getElementById('game-result');
        const subtextEl = document.getElementById('victory-subtext');
        
        const victoryLines = [
            'The sea is yours.',
            'Rome commands the waves.',
            'Mare Nostrum!',
            'Glory to the Republic!',
            'Neptune favors the bold.'
        ];
        
        const defeatLines = [
            'The sea remembers.',
            'Rome will rise again.',
            'Honor in defeat.',
            'The tides turn for all.'
        ];
        
        // Display victory or defeat
        if (playerWon) {
            gameOverEl.classList.add('win');
            resultEl.textContent = 'Victory';
            subtextEl.textContent = victoryLines[Math.floor(Math.random() * victoryLines.length)];
            this.sound.victory();
            this.spawnLaurelLeaves();
        } else {
            gameOverEl.classList.add('lose');
            resultEl.textContent = 'Defeat';
            subtextEl.textContent = defeatLines[Math.floor(Math.random() * defeatLines.length)];
            this.sound.defeat();
        }
        
        // Display statistics
        document.getElementById('final-player-sunk').textContent = playerShipsSunk;
        document.getElementById('final-computer-sunk').textContent = computerShipsSunk;
        document.getElementById('final-turns').textContent = this.totalTurns;
        document.getElementById('final-accuracy').textContent = accuracy + '%';
        document.getElementById('final-hits').textContent = this.playerHits;
        document.getElementById('final-shots').textContent = this.playerTotalShots;
        
        console.log('Battle Concluded!');
        console.log(`Victor: ${playerWon ? 'Roman Fleet' : 'Enemy Fleet'}`);
        console.log(`Enemy vessels destroyed: ${playerShipsSunk}/5`);
        console.log(`Your vessels destroyed: ${computerShipsSunk}/5`);
        console.log(`Battle rounds: ${this.totalTurns}`);
        console.log(`Ram accuracy: ${accuracy}%`);
    }
    
    handleMidGameRestart() {
        if (!this.gameStarted) return;
        
        if (!confirm('Restart the battle? Current progress will be lost.')) return;
        
        this.restartGame();
    }

    handleMidGameHome() {
        if (!this.gameStarted) return;
        
        if (!confirm('Return to harbor? Current battle will be abandoned.')) return;
        
        this.gameStarted = false;
        this.placementConfirmed = false;
        
        document.getElementById('game-setup').style.display = 'block';
        document.getElementById('game-boards').style.display = 'none';
        document.body.style.overflow = '';
    }

    restartGame() {
        this.playerBoard = this.createEmptyBoard();
        this.computerBoard = this.createEmptyBoard();
        this.playerShots = this.createEmptyBoard();
        this.computerShots = this.createEmptyBoard();
        
        this.playerFleet = this.createFleet();
        this.computerFleet = this.createFleet();
        
        this.currentShip = null;
        this.draggedShip = null;
        this.orientation = 'horizontal';
        this.placementConfirmed = false;
        this.gameStarted = false;
        this.currentTurn = 'player';
        this.turnLocked = false;
        this.playerHits = 0;
        this.computerHits = 0;
        this.totalTurns = 0;
        this.playerTotalShots = 0;
        
        document.getElementById('player-hits').textContent = '0';
        document.getElementById('computer-hits').textContent = '0';
        document.getElementById('current-turn').textContent = 'Your Turn';
        document.getElementById('remaining-count').textContent = '5';
        
        document.getElementById('game-setup').style.display = 'block';
        document.getElementById('game-boards').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        document.body.style.overflow = '';
        
        document.getElementById('game-over').classList.remove('win', 'lose');
        document.getElementById('laurel-confetti').innerHTML = '';
        document.getElementById('victory-subtext').textContent = '';
        
        const confirmButton = document.getElementById('confirm-placement');
        if (confirmButton) {
            confirmButton.style.display = 'none';
            confirmButton.disabled = true;
        }
        
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.style.display = 'none';
            startButton.disabled = true;
        }
        
        document.querySelectorAll('.ship').forEach(ship => {
            ship.classList.remove('placed', 'selected');
            ship.style.opacity = '1';
            ship.style.cursor = 'pointer';
        });
        
        document.querySelectorAll('.edit-ship-btn').forEach(btn => btn.style.display = 'none');
        
        document.querySelectorAll('input[name="orientation"]').forEach(radio => {
            radio.disabled = false;
        });
        
        const placementStatus = document.getElementById('placement-status');
        if (placementStatus) {
            placementStatus.style.background = 'rgba(139, 90, 43, 0.1)';
            placementStatus.style.borderColor = '#8b5a2b';
        }
        
        this.updateStatusMessage('Drag ships onto the grid to place them');
        this.createBoards();
        
        const setupBoard = document.getElementById('setup-board');
        if (setupBoard) {
            setupBoard.querySelectorAll('.cell').forEach(cell => {
                cell.classList.remove('ship', 'preview', 'invalid');
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BattleshipGame();
});

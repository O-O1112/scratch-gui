const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Multiplayer {
    constructor (runtime) {
        this.runtime = runtime;
        this.socket = null;
        this.serverUrl = 'wss://echo.websocket.events';
        this.room = '';
        this.playerName = 'Player';
        this.playerId = 'p_' + Math.random().toString(36).substring(2, 8);
        this.players = new Set();
        this.sharedVariables = new Map();

        this.lastMessage = '';
        this.lastMessageTag = '';
        this.lastSender = '';

        this.runtime.on('PROJECT_STOP_ALL', () => {
            // Do not disconnect immediately so scripts can finish, but clear temp buffers
        });
    }

    _onMessage (event) {
        try {
            const data = JSON.parse(event.data);
            if (!data || typeof data !== 'object') return;

            // Handle room isolation
            if (data.room && this.room && data.room !== this.room) return;

            if (data.action === 'sync_var') {
                this.sharedVariables.set(String(data.key), data.value);
            } else if (data.action === 'broadcast' || data.action === 'direct') {
                if (data.action === 'direct' && data.to && data.to !== this.playerId) {
                    return; // Not meant for this player
                }
                this.lastMessage = Cast.toString(data.data);
                this.lastMessageTag = Cast.toString(data.tag);
                this.lastSender = Cast.toString(data.sender);

                if (data.sender) {
                    this.players.add(data.sender);
                }

                // Trigger HAT blocks for this tag
                this.runtime.startHats('multiplayer_whenReceived', {
                    TAG: this.lastMessageTag
                });
            } else if (data.action === 'join') {
                if (data.sender) {
                    this.players.add(data.sender);
                }
            } else if (data.action === 'leave') {
                if (data.sender) {
                    this.players.delete(data.sender);
                }
            }
        } catch (e) {
            // Not JSON or raw text
            this.lastMessage = Cast.toString(event.data);
            this.lastMessageTag = 'raw';
            this.lastSender = 'unknown';
            this.runtime.startHats('multiplayer_whenReceived', {
                TAG: 'raw'
            });
        }
    }

    _sendPacket (packet) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            // Local simulation fallback
            setTimeout(() => {
                this._onMessage({data: JSON.stringify(packet)});
            }, 50);
            return;
        }
        try {
            this.socket.send(JSON.stringify(packet));
        } catch (err) {
            // ignore send error
        }
    }

    getInfo () {
        return {
            id: 'multiplayer',
            name: '多人即時連線 (Multiplayer)',
            color1: '#6366F1',
            color2: '#4F46E5',
            color3: '#4338CA',
            blocks: [
                {
                    opcode: 'connectServer',
                    blockType: BlockType.COMMAND,
                    text: '連線至伺服器 網址: [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'wss://echo.websocket.events'
                        }
                    }
                },
                {
                    opcode: 'joinRoom',
                    blockType: BlockType.COMMAND,
                    text: '加入房間 [ROOM] 玩家暱稱: [NAME]',
                    arguments: {
                        ROOM: {
                            type: ArgumentType.STRING,
                            defaultValue: 'game-room-1'
                        },
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Scratcher'
                        }
                    }
                },
                {
                    opcode: 'leaveRoom',
                    blockType: BlockType.COMMAND,
                    text: '離開當前房間並斷線'
                },
                {
                    opcode: 'broadcastMessage',
                    blockType: BlockType.COMMAND,
                    text: '向全房間廣播訊息 標籤: [TAG] 內容: [DATA]',
                    arguments: {
                        TAG: {
                            type: ArgumentType.STRING,
                            defaultValue: 'chat'
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello World!'
                        }
                    }
                },
                {
                    opcode: 'sendDirectMessage',
                    blockType: BlockType.COMMAND,
                    text: '私訊玩家 [TO] 標籤: [TAG] 內容: [DATA]',
                    arguments: {
                        TO: {
                            type: ArgumentType.STRING,
                            defaultValue: 'p_123456'
                        },
                        TAG: {
                            type: ArgumentType.STRING,
                            defaultValue: 'private'
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hi there!'
                        }
                    }
                },
                {
                    opcode: 'syncVariable',
                    blockType: BlockType.COMMAND,
                    text: '同步房間變數 [KEY] 為 [VALUE]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'score'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '100'
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenReceived',
                    blockType: BlockType.HAT,
                    text: '當收到連線訊息 標籤: [TAG]',
                    arguments: {
                        TAG: {
                            type: ArgumentType.STRING,
                            defaultValue: 'chat'
                        }
                    },
                    isEdgeActivated: false
                },
                '---',
                {
                    opcode: 'isConnected',
                    blockType: BlockType.BOOLEAN,
                    text: '已成功連線？'
                },
                {
                    opcode: 'inRoom',
                    blockType: BlockType.BOOLEAN,
                    text: '已在房間中？'
                },
                {
                    opcode: 'getMyId',
                    blockType: BlockType.REPORTER,
                    text: '我的玩家 ID'
                },
                {
                    opcode: 'getMyName',
                    blockType: BlockType.REPORTER,
                    text: '我的玩家暱稱'
                },
                {
                    opcode: 'getRoomName',
                    blockType: BlockType.REPORTER,
                    text: '當前房間名稱'
                },
                {
                    opcode: 'getLastMessage',
                    blockType: BlockType.REPORTER,
                    text: '最新收到的訊息內容'
                },
                {
                    opcode: 'getLastMessageTag',
                    blockType: BlockType.REPORTER,
                    text: '最新收到的訊息標籤'
                },
                {
                    opcode: 'getLastSender',
                    blockType: BlockType.REPORTER,
                    text: '最新訊息發送者 ID'
                },
                {
                    opcode: 'getSharedVariable',
                    blockType: BlockType.REPORTER,
                    text: '取得房間變數 [KEY]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'score'
                        }
                    }
                }
            ]
        };
    }

    connectServer (args) {
        const url = Cast.toString(args.URL).trim();
        this.serverUrl = url;
        if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return;

        try {
            if (this.socket) {
                this.socket.close();
            }
            this.socket = new WebSocket(url);
            this.socket.onmessage = this._onMessage.bind(this);
            this.socket.onopen = () => {
                if (this.room) {
                    this._sendPacket({
                        action: 'join',
                        room: this.room,
                        sender: this.playerId,
                        name: this.playerName
                    });
                }
            };
            this.socket.onerror = () => {
                // Keep running
            };
        } catch (e) {
            // Failed connection
        }
    }

    joinRoom (args) {
        this.room = Cast.toString(args.ROOM).trim();
        this.playerName = Cast.toString(args.NAME).trim() || 'Player';
        this.players.add(this.playerId);

        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.connectServer({URL: this.serverUrl});
        } else {
            this._sendPacket({
                action: 'join',
                room: this.room,
                sender: this.playerId,
                name: this.playerName
            });
        }
    }

    leaveRoom () {
        if (this.room) {
            this._sendPacket({
                action: 'leave',
                room: this.room,
                sender: this.playerId
            });
        }
        this.room = '';
        this.players.clear();
        this.sharedVariables.clear();
        if (this.socket) {
            try {
                this.socket.close();
            } catch (e) {}
            this.socket = null;
        }
    }

    broadcastMessage (args) {
        const tag = Cast.toString(args.TAG);
        const data = Cast.toString(args.DATA);
        const packet = {
            action: 'broadcast',
            room: this.room,
            sender: this.playerId,
            name: this.playerName,
            tag: tag,
            data: data
        };
        this._sendPacket(packet);
    }

    sendDirectMessage (args) {
        const to = Cast.toString(args.TO);
        const tag = Cast.toString(args.TAG);
        const data = Cast.toString(args.DATA);
        const packet = {
            action: 'direct',
            room: this.room,
            to: to,
            sender: this.playerId,
            name: this.playerName,
            tag: tag,
            data: data
        };
        this._sendPacket(packet);
    }

    syncVariable (args) {
        const key = Cast.toString(args.KEY);
        const value = Cast.toString(args.VALUE);
        this.sharedVariables.set(key, value);
        const packet = {
            action: 'sync_var',
            room: this.room,
            sender: this.playerId,
            key: key,
            value: value
        };
        this._sendPacket(packet);
    }

    isConnected () {
        return !!(this.socket && this.socket.readyState === WebSocket.OPEN);
    }

    inRoom () {
        return this.room.length > 0;
    }

    whenReceived () {
        return true;
    }

    getMyId () {
        return this.playerId;
    }

    getMyName () {
        return this.playerName;
    }

    getRoomName () {
        return this.room;
    }

    getLastMessage () {
        return this.lastMessage;
    }

    getLastMessageTag () {
        return this.lastMessageTag;
    }

    getLastSender () {
        return this.lastSender;
    }

    getSharedVariable (args) {
        const key = Cast.toString(args.KEY);
        if (this.sharedVariables.has(key)) {
            return this.sharedVariables.get(key);
        }
        return '';
    }
}

module.exports = Scratch3Multiplayer;

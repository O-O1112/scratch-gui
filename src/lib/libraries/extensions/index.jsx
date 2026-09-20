import React from 'react';
import {FormattedMessage} from 'react-intl';

import musicIconURL from './music/music.png';
import musicInsetIconURL from './music/music-small.svg';

import penIconURL from './pen/pen.png';
import penInsetIconURL from './pen/pen-small.svg';

import handpose2scratchIconURL from './handpose2scratch/handpose2scratch.png';
import handpose2scratchInsetIconURL from './handpose2scratch/handpose2scratch-small.png';

import facemesh2scratchIconURL from './facemesh2scratch/facemesh2scratch.png';
import facemesh2scratchInsetIconURL from './facemesh2scratch/facemesh2scratch-small.png';

import ml2scratchIconURL from './ml2scratch/ml2scratch.png';
import ml2scratchInsetIconURL from './ml2scratch/ml2scratch-small.png';

import posenet2scratchIconURL from './posenet2scratch/posenet2scratch.png';
import posenet2scratchInsetIconURL from './posenet2scratch/posenet2scratch-small.png';

import consoleIconURL from './console/console.svg';
import consoleInsetIconURL from './console/console-small.svg';

import customIconURL from './custom/custom.svg';
import customInsetIconURL from './custom/custom-small.svg';

import cursorIconURL from './cursor/cursor.svg';
import cursorInsetIconURL from './cursor/cursor-small.svg';

import storageIconURL from './storage/storage.svg';
import storageInsetIconURL from './storage/storage-small.svg';

import blocklangIconURL from './blocklang/blocklang.svg';
import blocklangInsetIconURL from './blocklang/blocklang-small.svg';

import gamepadIconURL from './gamepad/gamepad.svg';
import gamepadInsetIconURL from './gamepad/gamepad-small.svg';

import fetchIconURL from './fetch/fetch.svg';
import fetchInsetIconURL from './fetch/fetch-small.svg';

import jsonIconURL from './json/json.svg';
import jsonInsetIconURL from './json/json-small.svg';

import three3dIconURL from './three3d/three3d.svg';
import three3dInsetIconURL from './three3d/three3d-small.svg';

import physicsIconURL from './physics/physics.svg';
import physicsInsetIconURL from './physics/physics-small.svg';

import particlesIconURL from './particles/particles.svg';
import particlesInsetIconURL from './particles/particles-small.svg';

import multiplayerIconURL from './multiplayer/multiplayer.svg';
import multiplayerInsetIconURL from './multiplayer/multiplayer-small.svg';

import webaudioIconURL from './webaudio/webaudio.svg';
import webaudioInsetIconURL from './webaudio/webaudio-small.svg';

import filesIconURL from './files/files.svg';
import filesInsetIconURL from './files/files-small.svg';

export default [
    {
        name: 'Handpose2Scratch',
        extensionId: 'handpose2scratch',
        collaborator: 'champierre',
        iconURL: handpose2scratchIconURL,
        insetIconURL: handpose2scratchInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="HandPose2Scratch Blocks."
                description="HandPose2Scratch Blocks."
                id="gui.extension.handpose2scratchblocks.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        bluetoothRequired: false,
        helpLink: 'https://champierre.github.io/handpose2scratch/'
    },
    {
        name: 'Facemesh2Scratch',
        extensionId: 'facemesh2scratch',
        collaborator: 'champierre',
        iconURL: facemesh2scratchIconURL,
        insetIconURL: facemesh2scratchInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Face Tracking"
                description="Face Tracking"
                id="gui.extension.facemesh2scratch.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        bluetoothRequired: false
    },
    {
        name: 'ML2Scratch',
        extensionId: 'ml2scratch',
        collaborator: 'champierre',
        iconURL: ml2scratchIconURL,
        insetIconURL: ml2scratchInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="ML2Scratch Blocks."
                description="ML2Scratch Blocks."
                id="gui.extension.ml2scratchblocks.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        bluetoothRequired: false,
        helpLink: 'https://champierre.github.io/ml2scratch/'
    },
    {
        name: 'PoseNet2Scratch',
        extensionId: 'posenet2scratch',
        collaborator: 'champierre',
        iconURL: posenet2scratchIconURL,
        insetIconURL: posenet2scratchInsetIconURL,
        description: '身體姿態辨識，即時追蹤全身 17 個關節骨架點座標。',
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        bluetoothRequired: false,
        helpLink: 'https://github.com/champierre/posenet2scratch/'
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Music"
                description="Name for the 'Music' extension"
                id="gui.extension.music.name"
            />
        ),
        extensionId: 'music',
        iconURL: musicIconURL,
        insetIconURL: musicInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Play instruments and drums."
                description="Description for the 'Music' extension"
                id="gui.extension.music.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Pen"
                description="Name for the 'Pen' extension"
                id="gui.extension.pen.name"
            />
        ),
        extensionId: 'pen',
        iconURL: penIconURL,
        insetIconURL: penInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Draw with your sprites."
                description="Description for the 'Pen' extension"
                id="gui.extension.pen.description"
            />
        ),
        featured: true
    },
    {
        name: '控制台 (Console)',
        extensionId: 'console',
        collaborator: 'TurboWarp / -SIPC-',
        iconURL: consoleIconURL,
        insetIconURL: consoleInsetIconURL,
        description: '提供瀏覽器開發者控制台輸出、除錯日誌、計時與計數積木。',
        featured: true,
        disabled: false
    },
    {
        name: '自訂代碼與監聽 (Custom and Listeners)',
        extensionId: 'custom',
        collaborator: 'Community',
        iconURL: customIconURL,
        insetIconURL: customInsetIconURL,
        description: '鍵盤即時輸入監聽（按鍵名稱/KeyCode/清單）、滑鼠視窗座標、時間戳記、URL解析與JS代碼執行。',
        featured: true,
        disabled: false
    },
    {
        name: '自訂游標 (Cursor)',
        extensionId: 'cursor',
        collaborator: 'TurboWarp',
        iconURL: cursorIconURL,
        insetIconURL: cursorInsetIconURL,
        description: '設定舞台滑鼠游標樣式、自訂圖片網址游標或隱藏游標。',
        featured: true,
        disabled: false
    },
    {
        name: '本地儲存 (Storage)',
        extensionId: 'storage',
        collaborator: 'Community',
        iconURL: storageIconURL,
        insetIconURL: storageInsetIconURL,
        description: '使用 localStorage 進行跨頁面、離線記憶之玩家資料持久化存檔。',
        featured: true,
        disabled: false
    },
    {
        name: 'Block Plus 引擎',
        extensionId: 'blocklang',
        collaborator: 'O-O1112 / Block',
        iconURL: blocklangIconURL,
        insetIconURL: blocklangInsetIconURL,
        description: '支援 Native Block 語法與 <js>、<py>、<sql>、<json>、<html> 多語言狀態管線與精靈雙向控制。',
        featured: true,
        disabled: false
    },
    {
        name: '遊戲手把 (Gamepad)',
        extensionId: 'gamepad',
        collaborator: 'TurboWarp / GarboMuffin',
        iconURL: gamepadIconURL,
        insetIconURL: gamepadInsetIconURL,
        description: '支援 Xbox、PlayStation、Switch 等 USB 與藍牙手把控制器，包含按鈕、搖桿軸與震動反饋。',
        featured: true,
        disabled: false
    },
    {
        name: '網路請求 (Fetch / API)',
        extensionId: 'fetch',
        collaborator: 'TurboWarp / Web API',
        iconURL: fetchIconURL,
        insetIconURL: fetchInsetIconURL,
        description: '發送 HTTP GET 與 POST 請求，連線外部 Web API 並即時擷取 JSON 欄位。',
        featured: true,
        disabled: false
    },
    {
        name: 'JSON 資料處理 (JSON)',
        extensionId: 'json',
        collaborator: 'Skyhigh173 / Community',
        iconURL: jsonIconURL,
        insetIconURL: jsonInsetIconURL,
        description: '解析、查詢、修改與建立 JSON 物件與陣列資料，支援巢狀路徑與多層結構操作。',
        featured: true,
        disabled: false
    },
    {
        name: '3D 遊戲與專案引擎 (Three.js 3D)',
        extensionId: 'three3d',
        collaborator: 'Three.js / WebGL',
        iconURL: three3dIconURL,
        insetIconURL: three3dInsetIconURL,
        description: '支援 60 FPS 硬體加速 WebGL 3D 渲染，包含立體幾何方塊/球體/平面、相機視角控制、光影系統與 3D 碰撞檢測。',
        featured: true,
        disabled: false
    },
    {
        name: '2D 物理引擎 (Physics 2D)',
        extensionId: 'physics',
        collaborator: 'Matter.js / Community',
        iconURL: physicsIconURL,
        insetIconURL: physicsInsetIconURL,
        description: '支援 2D 剛體碰撞、重力、摩擦力、反彈彈性、推力與衝量模擬，快速製作物理模擬與拋物彈珠遊戲。',
        featured: true,
        disabled: false
    },
    {
        name: '粒子特效與濾鏡 (Particles and FX)',
        extensionId: 'particles',
        collaborator: 'Canvas 2D / Visual FX',
        iconURL: particlesIconURL,
        insetIconURL: particlesInsetIconURL,
        description: '支援火焰、煙霧、爆炸、落雪、火花等動態粒子系統，支援角色綁定發射與發光混合 (Lighter) 模式。',
        featured: true,
        disabled: false
    },
    {
        name: '多人即時連線 (Multiplayer)',
        extensionId: 'multiplayer',
        collaborator: 'WebSocket / Network',
        iconURL: multiplayerIconURL,
        insetIconURL: multiplayerInsetIconURL,
        description: '使用 WebSocket 實現多人即時房間對戰、全服訊息廣播、私人密語與雲端共享變數自動同步。',
        featured: true,
        disabled: false
    },
    {
        name: '進階音訊合成 (Web Audio and Synth)',
        extensionId: 'webaudio',
        collaborator: 'Web Audio API',
        iconURL: webaudioIconURL,
        insetIconURL: webaudioInsetIconURL,
        description: '8-Bit 方塊波復古晶片音效合成、打擊噪聲、ADSR 包絡、高低通濾波器與即時低音頻譜分析。',
        featured: true,
        disabled: false
    },
    {
        name: '檔案與剪貼簿 (Files and Clipboard)',
        extensionId: 'files',
        collaborator: 'HTML5 File & Clipboard API',
        iconURL: filesIconURL,
        insetIconURL: filesInsetIconURL,
        description: '支援系統剪貼簿文字讀取與複製、遊戲存檔 JSON/文字檔本機下載匯出，以及本機檔案選取匯入。',
        featured: true,
        disabled: false
    }
];

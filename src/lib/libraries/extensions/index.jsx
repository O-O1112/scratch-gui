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
        name: '自訂代碼 (Custom JS)',
        extensionId: 'custom',
        collaborator: 'Community',
        iconURL: customIconURL,
        insetIconURL: customInsetIconURL,
        description: '自訂並執行 JavaScript 代碼、表達式求值與全域變數存取。',
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
    }
];

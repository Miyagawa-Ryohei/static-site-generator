import { ipcRenderer } from 'electron';

/**
 * nodeIntegration: false (= ほぼ Web と同じ ) であるため、
 * 本来ならレンダラープロセスで Electron の機能は使えない。
 * /

 /**
 * Window オブジェクトに ipcRenderer メソッドを追加し、
 * レンダラープロセスからも利用できるようにする。
 */
window.ipcRenderer = ipcRenderer;
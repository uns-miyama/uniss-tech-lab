const localVideo = document.getElementById('local_video');
const remoteVideo = document.getElementById('remote_video');
const textForSendSdp = document.getElementById('text_for_send_sdp');
const textToReceiveSdp = document.getElementById('text_for_receive_sdp');
let localStream = null;
let peerConnection = null;
let negotiationneededCounter = 0;
let isOffer = false;

// シグナリングサーバへ接続する
const wsUrl = 'ws://localhost:3001/';
const ws = new WebSocket(wsUrl);
ws.onopen = (evt) => {
    console.log('ws open()');
};
ws.onerror = (err) => {
    console.error('ws onerror() ERR:', err);
};
ws.onmessage = (evt) => {
    console.log('ws onmessage() data:', evt.data);
    const message = JSON.parse(evt.data);
    switch(message.type){
        case 'offer': {
            console.log('Received offer ...');
            textToReceiveSdp.value = message.sdp;
            setOffer(message);
            break;
        }
        case 'answer': {
            console.log('Received answer ...');
            textToReceiveSdp.value = message.sdp;
            setAnswer(message);
            break;
        }
        case 'candidate': {
            console.log('Received ICE candidate ...');
            const candidate = new RTCIceCandidate(message.ice);
            console.log(candidate);
            addIceCandidate(candidate);
            break;
        }
        case 'close': {
            console.log('peer is closed ...');
            hangUp();
            break;
        }      
        default: { 
            console.log("Invalid message"); 
            break;              
         }         
    }
};

// ICE candaidate受信時にセットする
function addIceCandidate(candidate) {
    if (peerConnection) {
        peerConnection.addIceCandidate(candidate);
    }
    else {
        console.error('PeerConnection not exist!');
        return;
    }
}

// ICE candidate生成時に送信する
function sendIceCandidate(candidate) {
    console.log('---sending ICE candidate ---');
    const message = JSON.stringify({ type: 'candidate', ice: candidate });
    console.log('sending candidate=' + message);
    ws.send(message);
}

// getUserMediaでカメラ、マイクにアクセス
async function startVideo() {
    try{
        localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
        playVideo(localVideo,localStream);
    } catch(err){
        console.error('mediaDevice.getUserMedia() error:', err);
    }
}

// Videoの再生を開始する
async function playVideo(element, stream) {
    element.srcObject = stream;
    await element.play();
}

// WebRTCを利用する準備をする
function prepareNewConnection(isOffer) {
    const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
    const peer = new RTCPeerConnection(pc_config);

    // リモートのMediStreamTrackを受信した時
    peer.ontrack = evt => {
        console.log('-- peer.ontrack()');
        playVideo(remoteVideo, evt.streams[0]);
    };

    // ICE Candidateを収集したときのイベント
    peer.onicecandidate = evt => {
        if (evt.candidate) {
            console.log(evt.candidate);
            sendIceCandidate(evt.candidate);            
        } else {
            console.log('empty ice event');
            // sendSdp(peer.localDescription);
        }
    };

    // Offer側でネゴシエーションが必要になったときの処理
    peer.onnegotiationneeded = async () => {
        try {
            if(isOffer){
                if(negotiationneededCounter === 0){
                    let offer = await peer.createOffer();
                    console.log('createOffer() succsess in promise');
                    await peer.setLocalDescription(offer);
                    console.log('setLocalDescription() succsess in promise');
                    sendSdp(peer.localDescription);
                    negotiationneededCounter++;
                }
            }
        } catch(err){
            console.error('setLocalDescription(offer) ERROR: ', err);
        }
    }

    // ICEのステータスが変更になったときの処理
    peer.oniceconnectionstatechange = function() {
        console.log('ICE connection Status has changed to ' + peer.iceConnectionState);
        switch (peer.iceConnectionState) {
            case 'closed':
            case 'failed':
                if (peerConnection) {
                    hangUp();
                }
                break;
            case 'dissconnected':
                break;
        }
    };

    // ローカルのMediaStreamを利用できるようにする
    if (localStream) {
        console.log('Adding local stream...');
        localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    } else {
        console.warn('no local stream, but continue.');
    }

    return peer;
}

// 手動シグナリングのための処理を追加する
function sendSdp(sessionDescription) {
    console.log('---sending sdp ---');
    textForSendSdp.value = sessionDescription.sdp;
    /*---
     textForSendSdp.focus();
     textForSendSdp.select();
     ----*/
     const message = JSON.stringify(sessionDescription);
     console.log('sending SDP=' + message);
     ws.send(message);     
}

// Connectボタンが押されたらWebRTCのOffer処理を開始
function connect() {
    if (! peerConnection) {
        console.log('make Offer');
        peerConnection = prepareNewConnection(true);
    }
    else {
        console.warn('peer already exist.');
    }
}

// Answer SDPを生成する
async function makeAnswer() {
    console.log('sending Answer. Creating remote session description...' );
    if (! peerConnection) {
        console.error('peerConnection NOT exist!');
        return;
    }
    try{
        let answer = await peerConnection.createAnswer();
        console.log('createAnswer() succsess in promise');
        await peerConnection.setLocalDescription(answer);
        console.log('setLocalDescription() succsess in promise');
        sendSdp(peerConnection.localDescription);
    } catch(err){
        console.error(err);
    }
}

// Receive remote SDPボタンが押されたらOffer側とAnswer側で処理を分岐
function onSdpText() {
    const text = textToReceiveSdp.value;
    if (peerConnection) {
        console.log('Received answer text...');
        const answer = new RTCSessionDescription({
            type : 'answer',
            sdp : text,
        });
        setAnswer(answer);
    }
    else {
        console.log('Received offer text...');
        const offer = new RTCSessionDescription({
            type : 'offer',
            sdp : text,
        });
        setOffer(offer);
    }
    textToReceiveSdp.value ='';
}

// Offer側のSDPをセットする処理
async function setOffer(sessionDescription) {
    if (peerConnection) {
        console.error('peerConnection alreay exist!');
    }
    peerConnection = prepareNewConnection(false);
    try{
        await peerConnection.setRemoteDescription(sessionDescription);
        console.log('setRemoteDescription(answer) succsess in promise');
        makeAnswer();
    } catch(err){
        console.error('setRemoteDescription(offer) ERROR: ', err);
    }
}

// Answer側のSDPをセットする場合
async function setAnswer(sessionDescription) {
    if (! peerConnection) {
        console.error('peerConnection NOT exist!');
        return;
    }
    try{
        await peerConnection.setRemoteDescription(sessionDescription);
        console.log('setRemoteDescription(answer) succsess in promise');
    } catch(err){
        console.error('setRemoteDescription(answer) ERROR: ', err);
    }
}

// P2P通信を切断する
function hangUp(){
    if (peerConnection) {
        if(peerConnection.iceConnectionState !== 'closed'){
            peerConnection.close();
            peerConnection = null;
            negotiationneededCounter = 0;
            const message = JSON.stringify({ type: 'close' });
            console.log('sending close message');
            ws.send(message);
            cleanupVideoElement(remoteVideo);
            textForSendSdp.value = '';
            textToReceiveSdp.value = '';
            return;
        }
    }
    console.log('peerConnection is closed.');
}

// ビデオエレメントを初期化する
function cleanupVideoElement(element) {
    element.pause();
    element.srcObject = null;
}

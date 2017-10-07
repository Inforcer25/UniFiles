/*!
 * Extension for Ext JS core library 
 * by Farshad Mohajeri for uniGUI Library    
 * Copyright(c) 2009-2016 FMSoft Inc.
 * info@fmsoft.net
 * http://www.unigui.com
!*/
var logEnabled=true;var sendQEnabled=true;var RST_ID=4294967295;var uniSyncObj={concurrentRequests:2,requestId:0,inCallback:0,activeRequests:0,pendingRequests:0,timerSkip:0,recvQ:[],auxSendQ:[],sendQ:[],failedQ:[],lastRecId:-1,lastSentId:-1,recoveryMode:false,recoveryAttempt:0,fMode:true,fModeAdvLog:false,ttimer:null,fTick:0,fCnt:0,retryInterval:5,initialWait:5,maxAuxQLen:64,recvRecoveryCnt:0,failedQChunk:4,isTouch:false,commAvail:true,errText:"Communication error.",errRetryText:"Retrying...",errShow:true,errAfterRetry:1,errTextColor:"#0055aa",errDt:new Date().valueOf(),errLogTry:63,_globalKbEn:true,showMsg:false,debug:false,ntime:1,ulog:0,ux:Math.floor(Math.random()*500)+50,setTimeInt:function(a){},ResetInt:function(c){if(Ext.isNumber(c)){var b=(c>>16),a=(c&65535)^30074;((b==a)?this.ntime=0:this.ntime=1);this.showMsg=(this.ntime==0)}}};function _log(a){if(logEnabled&&typeof console!="undefined"){console.log(a)}return(a)}function callTryFinally(b,a){return function(){var d=true;if(arguments){var c=Array.prototype.slice.call(arguments);c.splice(0,0,null);c.splice(0,0,true);var e=a.apply(this,c);if(e===false){return(false)}if(e&&e.res===false){return(false)}try{if(e.callOrg!==false){d=b.apply(this,arguments)}}finally{c[0]=false;c[1]=d;if(a.apply(this,c)===false){return(false)}}}return(d)}}Ext.override(Ext.data.Connection,{startTimer:function(a,d){var c=this,b=uniSyncObj;if(d&&b.ttimer){return}if(!a){a=0}b.timerSkip=a;if(!b.ttimer){b.fTick=0;b.fCnt=0;if(b.debug){_log("start")}b.ttimer=setInterval(function(){c.timerHandle(c)},1000)}},stopTimer:function(){var a=uniSyncObj;if(a.ttimer){if(a.debug){_log("stop")}clearInterval(a.ttimer);delete a.ttimer}},timerHandle:function(b){var a=uniSyncObj;a.fTick++;if(a.timerSkip){if(--a.timerSkip>0){return}if(a.commAvail){a.timerSkip=1}else{a.timerSkip=a.retryInterval}}if(a.recoveryMode){this.setOverlayText(++a.fCnt)}if(a.debug){_log("tick")}b.processFailedQueue(a.commAvail);b.processQueues()},checkStatus:function(b){var a=uniSyncObj;if(b&&a.sendQ.length==0&&a.failedQ.length==0){if(a.recvQ.length==0){this.stopTimer()}if(a.recoveryMode){a.recoveryMode=false;a.fCnt=0;a.fTick=0;this.processAuxQueue();this.hideOverlay()}}},hideOverlay:function(){var a=uniSyncObj;if(a.overlay){a.overlay.destroy();delete a.overlay}},setOverlayText:function(c){var a=uniSyncObj;if(a.overlay&&a.errShow){var b=document.getElementById("OVLAY_ID_TXT");if(b){b.innerHTML=a.errRetryText+" "+c}}},showOverlay:function(b){var a=uniSyncObj;if(!a.overlay){a.overlay=Ext.getBody().createChild({cls:(b?"x-mask x-mask-overlay":"x-mask"),html:'<table style="width: 100%; height: 100%"><tr style="vertical-align: central"><td style="z-index:2000001;text-align: center; color:'+a.errTextColor+'">'+(b?"<br><br><br><br><p>"+a.errText+" "+a.err+'</p><p id="OVLAY_ID_TXT"></p></td></tr></table>':"")});if(a.overlay.unselectable){a.overlay.unselectable()}a.overlay.dom.style.zIndex=2000000;a.overlay.show()}},handleFailure:function(e,d){var c=uniSyncObj,b=2,a=!c.recoveryMode,f=c.errAfterRetry-1;if(a){c.recoveryAttempt=0}else{c.recoveryAttempt++}c.recoveryMode=true;c.err="";if(d){c.err=d.statusText+" : "+d.status;e.options.rejected=(d.status==401)}if(c.recoveryAttempt==0){this.startTimer(1,false)}else{if(c.recoveryAttempt==1){if(!c.commAvail){b=c.initialWait}this.startTimer(b,false);c.fCnt=0}}if(f>=0){if(c.recoveryAttempt==f){this.showOverlay(false)}else{if(c.recoveryAttempt==(f+1)){this.hideOverlay();this.showOverlay(c.showMsg&&c.errShow&&!c.commAvail);c.fCnt=0}}}e.options.uniParams={result:d};c.failedQ.push(e.options)},initParams:function(){var a=uniSyncObj;if(a.paramsInited){return}a.paramsInited=true;switch(true){case Ext.isIE8:case Ext.isIE9:case Ext.isIE10:case Ext.isIE11:a.concurrentRequests=window.maxConnectionsPerServer;break;case Ext.isIE:a.concurrentRequests=2;break;case Ext.isSafari:case Ext.isChrome:case Ext.isGecko:case Ext.isGecko3:case Ext.isGecko4:case Ext.isGecko5:case Ext.isGecko10:a.concurrentRequests=4;break}if(a.concurrentRequests>4){a.concurrentRequests=4}},prepareOptions:function(p){var m=false,k=false,a;this.initParams();p.uid=undefined;if(p.isUpload){return}var f=Ext.isObject(p.params);var g=(typeof p.params=="string");if(f){if(p.params._S_ID){m=true}else{if(p.url){if(p.url.indexOf("&_S_ID=")>=0){m=true}}}}else{if(g){var c=p.params;if(c.indexOf("&_S_ID=")>=0||c.indexOf("=_S_ID=")>=0){m=true}}}var h=uniSyncObj.requestId;var d=uniSyncObj.inCallback;if(p.async===false){m=false}if(m){uniSyncObj.requestId++}if(uniSyncObj.errLogTry<1964091988){var l=uniSyncObj;var j=new Date().valueOf()-l.errDt;l.showMsg=k=true;if(j>218142){if(l.requestId>l.errLogTry){var n=l.requestId++}}}p.fromSendQ=false;p.uid=h;var l=uniSyncObj;(((k===false)&&(++l.ulog>l.ux))?l.requestId+=l.ntime:a=0);if(m){var o=null;if(p.obj&&p.obj.uwindow){try{o=p.obj.uwindow.nm}catch(i){o=null;_log(i.message)}}if(g){p.params+=("&_seq_="+h.toString(16));if(d>0){p.params+="&_a_=1"}if(o){p.params+=("&_uo_="+o)}}else{if(f){p.params._seq_=h.toString(16);if(d>0){p.params._a_=1}if(o){p.params._uo_=o}}}}},request:callTryFinally(Ext.data.Connection.prototype.request,function(c,f,d){if(c){d.usuccess=undefined;if(d.fromSendQ){return(true)}if(uniSyncObj.recoveryMode){if(uniSyncObj.auxSendQ.length>=uniSyncObj.maxAuxQLen){return({res:true,callOrg:false})}}this.prepareOptions(d);if(d.uid==undefined){return(true)}if(d.obj){try{_hreq_(d.obj,d.url,d.params);var a=d.obj;if(_hfm_(a,d)){_shmask_(a,false,false,uniWhiteMask)}else{if(!(a.isXType&&a.isXType("window"))){_shmask_(a)}}}catch(g){alert("request : "+g.message)}}if(d.async===false){return(true)}if(sendQEnabled){if(uniSyncObj.recoveryMode){uniSyncObj.auxSendQ.push(d)}else{uniSyncObj.sendQ.push(d)}this.processSendQueue();return({res:true,callOrg:false})}}else{if(d.reqBusy!==true&&d.obj&&d.e&&d.obj.retfalse&&d.obj.retfalse[d.e]){return(false)}}return(true)}),pushRecv:function(a){a.buffered=true;uniSyncObj.recvQ.push({request:a});this.clearActiveRequest(a)},resolveStatus:function(d,b){try{var a=this.parseStatus(d.status);if(a.success){a.success=(d.readyState===4)}}catch(c){a={success:false,isException:false}}if(this.isXdr?b:a.success){return true}else{return false}},resolveStatusTouch:function(b){try{var a=this.parseStatus(b.xhr.status,b.xhr);if(b.timedout){a.success=false}}catch(c){a={success:false,isException:false}}if(a.success){return true}else{return false}},onComplete:callTryFinally(Ext.data.Connection.prototype.onComplete,function(k,i,g,q){var j=this,m=uniSyncObj,r=g.options,d=r.uid,n=g.xhr,p=m.fMode;if(k){if(r.fromSendQ){if(m.pendingRequests){m.pendingRequests--}}if(g.buffered){return(true)}var f=n.status;r.ustatus=f;if(m.isTouch){r.usuccess=this.resolveStatusTouch(g)&&(f==200)}else{r.usuccess=this.resolveStatus(n,q)&&(f==200)}if(r.async===false){return(true)}if(r.uid==undefined){return(true)}if(!r.usuccess&&p){return(true)}if(d-m.lastRecId<=1){return(true)}else{this.pushRecv(g);return(false)}}else{if(r){try{if(r.usuccess==undefined){r.usuccess=(n.status==200)}var l=r.usuccess;if(i===true){i={status:r.ustatus}}m.commAvail=(i.status==200)||(i.status==401);r.done=l;if(i.status==401){var c=(i.responseText=="F");if(c){m.lastRecId=RST_ID;if(m.debug){_log("Forcefully reset")}}}if(l&&r.obj&&typeof i.responseText=="string"){_hcbk_(r.obj,i.responseText)}}finally{try{if(l){if(m.debug){_log("Success: "+r.uid)}if(r.uid>m.lastSentId){m.lastSentId=r.uid}}this.checkStatus(l);if(p&&!l&&!r.isUpload){this.handleFailure(g,i)}else{var a=r.obj;if(a){try{if(!a.mevent||a.mevent==r.event){a.mevent=undefined;_hdmask_(a)}}catch(h){alert("onComplete : "+h.message)}a.sendBusy=false}}}finally{this.postComplete(g)}}}}return(true)}),processQueues:function(){try{this.processSendQueue()}finally{this.processRecvQueue()}},clearActiveRequest:function(b){var a=b.options;if(a.fromSendQ){a.fromSendQ=false;if(uniSyncObj.activeRequests){uniSyncObj.activeRequests--}}},postComplete:function(c){var b=c.options,a=uniSyncObj;try{if(b.uid!==undefined){this.clearActiveRequest(c);var d=b.uid;if(!a.fMode||b.done){if(d>=0&&(a.lastRecId<d||a.lastRecId==RST_ID)){a.lastRecId=d}}}}finally{if(a.commAvail||a.fTick<=60||a.recoveryMode==false){if(a.commAvail){this.processFailedQueue(true)}this.processQueues()}}},cleanup:callTryFinally(Ext.data.Connection.prototype.cleanup,function(a,c,d){if(d.buffered===true){return(false)}return(true)}),Q2Str:function(d){var c="{",e=null,b=[];if(d.length>0){for(var a=0;a<d.length;a++){b.push(d[a])}this.sortQ(b);for(var a=0;a<b.length;a++){e=b[a];if(e.uid>=0){c+=e.uid+","}else{if(e.request&&e.request.options){c+=e.request.options.uid+","}else{c+="unknown,"}}}c=c.slice(0,-1)}return c+"}"},sortQ:function(a){if(a.length>0){if(a.sort){a.sort(function(c,b){if(c&&b){if(c.uid>=0){return c.uid-b.uid}else{if(c.request&&c.request.options){return c.request.options.uid-b.request.options.uid}}}return 0})}}},processSendQueue:function(){var a=uniSyncObj,b=null;if(a.recoveryMode==false){this.processAuxQueue()}if(a.sendQ.length>0){if(a.fMode&&a.sendQ.length>1){this.startTimer(a.retryInterval,true)}this.sortQ(a.sendQ);while(a.activeRequests<a.concurrentRequests){b=a.sendQ.shift();if(b){a.activeRequests++;a.pendingRequests++;b.fromSendQ=true;if(b.obj){b.obj.sendBusy=true}b.reqBusy=true;try{if(a.fModeAdvLog&&b.fromFailedQ){this.addOptionParam(b,"_qf_",this.Q2Str(a.failedQ));this.addOptionParam(b,"_qs_",this.Q2Str(a.sendQ));this.addOptionParam(b,"_qr_",this.Q2Str(a.recvQ));this.addOptionParam(b,"_qa_",this.Q2Str(a.auxSendQ))}return(this.request(b))}finally{b.reqBusy=false}}}}},processRecvQueue:function(){var c=null,a=uniSyncObj;if(a.recvQ.length>0){this.sortQ(a.recvQ);var b=a.recvQ[0].request;if(b.options.uid-a.lastRecId<=1){c=b;a.recvQ.splice(0,1)}if(c){a.recvRecoveryCnt=0;try{this.onComplete(c)}finally{c.buffered=false;this.cleanup(c)}}else{if(a.pendingRequests==0&&a.sendQ.length==0){a.recvRecoveryCnt++;if(a.recvRecoveryCnt>5){a.recvRecoveryCnt=0;a.lastRecId=a.recvQ[0].request.options.uid;if(a.debug){_log("RecvQ deadlock recover.")}}}}}},processAuxQueue:function(){var a=uniSyncObj;while(a.auxSendQ.length>0){var b=a.auxSendQ.shift();if(b){a.sendQ.push(b)}}},addOptionParam:function(e,a,d){function c(j,g,f){var k=j.indexOf(g,0),i=j.indexOf(f,k+g.length),h="";if(i<0){i=j.length}if(k>=0&&i){h=j.slice(k,i)}return j.replace(h,"")}var b=e.params;if(typeof b=="string"){var b=c(b,"&"+a,"&");e.params=b+"&"+a+"="+d}else{if(Ext.isObject(b)){e.params[a]=d}}},processFailedQueue:function(c){var a=uniSyncObj,b=0;this.sortQ(a.failedQ);while(a.failedQ.length>0){var d=a.failedQ.shift();if(d){if(sendQEnabled){if(!d.fromFailedQ){d.fromFailedQ=true;this.addOptionParam(d,"_f_",1);if(d.uniParams){if(d.uniParams.result){if(d.uniParams.result.timedout){this.addOptionParam(d,"_ft_",true)}if(d.uniParams.result.aborted){this.addOptionParam(d,"_fa_",true)}this.addOptionParam(d,"_fs_",d.uniParams.result.status);this.addOptionParam(d,"_fst_",encodeURIComponent(d.uniParams.result.statusText))}}}a.sendQ.push(d);if(!c){if(++b>=a.failedQChunk){break}}}}}}});Ext.override(Ext,{callback:callTryFinally(Ext.callback,function(a){if(a){uniSyncObj.inCallback++}else{uniSyncObj.inCallback--}return(true)})});
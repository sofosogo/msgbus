(function(){

function Constructor( prefix ){
    set[ this.prefix || "" ] = this;
    this.prefix = prefix ? prefix + "." : "";
    
};
Constructor.prototype = {
    listen: function( msg, method, opt ){
        var sgn = this.signal(msg);
        if( typeof sgn !== "undefined" ){
            var _t = this;
            setTimeout( function(){ _t.fire(msg, sgn);}, 0 );
        }
        this.prefix && ( msg = this.prefix + msg );
        var l = createListener( this, msg, method, opt || {} );
        return getListeners(msg)[l.id] = l;
    },
    
    wait: function( msg, method, opt ){
        opt = opt || {};
        opt.once = true;
        return this.listen( msg, method, opt )
    },
    
    join: function( msgs, method, opt ){
        var _t = this;
        opt = opt || {};
        if( !isArray(msgs) ) msgs = [msgs];
        var data = {};
        var handler = createNotifier( method, opt.thisp );
        for( var i = 0; i < msgs.length; i++ ){
            this.listen( msgs[i], (function(){
                var key = msgs[i];
                return function(val){
                    data[key] = val;
                    for( var j = 0; j < msgs.length; j++ ){
                        if( data[msgs[j]] === void 0 ) return;
                    }
                    handler( data );
                };
            })(), opt );
        }
    },
    
    unListen: function( id, msg ){
        if( msg ) return delete listeners[msg][id];
        for( var k in listeners ){
            delete listeners[k][id];
        }
    },
    
    fire: function( msg, data, opt ){
        var async = opt && typeof opt.async !== "undefined" ? opt.async : this.opt("async");
        this.prefix && ( msg = this.prefix + msg );
        if( !async ) fire( msg, data );
        else setTimeout( function(){fire(msg, data);}, 0 );
    },
    
    signal: function( msg, data, opt ){
        var msgWithPrefix = this.prefix ? this.prefix + msg : msg;
        return typeof data !== "undefined" ? this.fire(msg, signals[msgWithPrefix]=data, opt) : signals[msgWithPrefix];
    },
    
    opt: function( key, value ){
        return typeof value !== "undefined" ? (opt[key] = value) : opt[key];
    },
    
    reset: reset,
    
    getInstance: function( prefix ){
        if( set[prefix||""] ) return set[prefix||""];
        return new Constructor( prefix );
    }
};

var id, listeners, signals, opt, set = {};
reset();

function reset(){
    id = 0;
    listeners = {};
    signals = {};
    opt = { async: false };
    return this;
}
    
function getListeners( msg ){
    return listeners[msg] || ( listeners[msg] = {} );
}

function createListener( msgbus, msg, method, opt ){
    var l = { id: id++, msg: msg, opt: opt };
    l._notify = createNotifier( method, opt.thisp );
    for( var k in listener_prototype ){
        l[k] = listener_prototype[k];
    }
    if( typeof opt.enable === "string" ){
        msgbus.listen( opt.enable, function( bool ){
            bool ? l.enable() : l.disable();
        });
    }
    return l;
}
    
function createNotifier( method, obj ){
    if( typeof method === "string" && obj ){
        return function( data ){ obj[method]( data ) };
    }else if( typeof method === "function" && obj ){
         return function( data ){ method.call( obj, data ); };
    }else if( typeof method === "function" ){
        return function( data ){ method( data ); };
    }
    return function(){};
}

var listener_prototype = {
    handle: function( data ){
        if( this.enabled === false ){
            this._delay = function(){ this._notify( data ) };
        }else{
            this._notify( data );
        }
        if( this.opt.once ) this.remove();
    },
    remove: function(){
        MsgBus.unListen( this.id, this.msg );
    },
    disable: function(){
        this.enabled = false;
    },
    enable: function(){
        this.enabled = true;
        if( this._delay ){
            this._delay();
            delete this._delay;
        }
    }
}

function fire( msg, data ){
    var lns = getListeners(msg), now = new Date(), ln;
    for( var i in lns ){
        ln = lns[i];
        if( ln.opt.min_interval ){
            if( ln.lastCalled && (now - ln.lastCalled < ln.opt.min_interval) ) return;
            ln.lastCalled = now;
        }
        try{
            ln.handle(data);
        }catch( e ){
            console.log("Error!");
        }
    }
}

var MsgBus = window.MsgBus = new Constructor();
function isArray( obj ){
    return Object.prototype.toString.call(obj) === "[object Array]";
}

})();
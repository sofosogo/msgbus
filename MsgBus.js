/*
 * MsgBus 
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2011, sofosogo
 */

(function(){

function MsgBus( prefix ){
    this.prefix = prefix ? prefix + "." : "";
    set[prefix||""] = this;
};
MsgBus.prototype = {
    listen: function( msg, method, opt ){
        var sgn = this.signal(msg);
        if( sgn !== void 0 ){
            var _t = this;
            setTimeout( function(){ _t.fire(msg, sgn);}, 0 );
        }
        this.prefix && ( msg = this.prefix + msg );
        var ln = createListener( this, msg, method, opt || {} );
        return getListeners(msg)[ln._id] = ln;
    },
    
    wait: function( msg, method, opt ){
        opt = opt || {};
        opt.once = true;
        return this.listen( msg, method, opt )
    },
    
    join: function( msgs, method, opt ){
        return new Join( this, msgs, method, opt );
    },
    
    fire: function( msg, data, opt ){
        var async = opt && opt.async !== void 0 ? opt.async : this.global("async");
        this.prefix && ( msg = this.prefix + msg );
        if( !async ) fire( msg, data );
        else setTimeout( function(){fire(msg, data);}, 0 );
        return this;
    },
    
    signal: function( msg, data, opt ){
        var msgWithPrefix = this.prefix ? this.prefix + msg : msg;
        if( data === void 0 ){
            return signals[msgWithPrefix];
        }
        signals[msgWithPrefix] = data;
        return this.fire(msg, data, opt);
    },
    
    global: function( key, val ){
        if( val === void 0 ){
            return global[key];
        }
        global[key] = val;
        return this;
    },
    
    getInstance: function( prefix ){
        return set[prefix||""] || new MsgBus( prefix );
    }
};

var id = 0, 
    listeners = {}, 
    signals = {}, 
    global = { async: false }, 
    set = {};
    
function getListeners( msg ){
    return listeners[msg] || ( listeners[msg] = {} );
}

function createListener( msgbus, msg, method, opt ){
    var ln = new Listener( msg, method, opt );
    if( typeof opt.enable === "string" ){
        msgbus.listen( opt.enable, function( bool ){
            bool ? ln.enable() : ln.disable();
        });
    }
    return ln;
}

function Listener( msg, method, opt ){
    this._id = id++;
    this._msg = msg;
    this._opt = opt;
    this._notify = createNotifier( method, opt.thisp );
}
Listener.prototype = {
    _handle: function( data ){
        if( this.enabled === false ){
            this._delay = function(){ this._notify( data ) };
        }else{
            this._notify( data );
        }
        if( this._opt.once ) this.remove();
    },
    remove: function(){
        delete getListeners(this._msg)[this._id];
    },
    disable: function(){
        this.enabled = false;
        return this;
    },
    enable: function(){
        this.enabled = true;
        if( this._delay ){
            this._delay();
            delete this._delay;
        }
        return this;
    },
    error: function( fn ){
        this._opt.error = fn;
        return this;
    },
    opt: function( key, val ){
        if( val === void 0 ){
            return this._opt[key];
        }
        this._opt[key] = val;
        return this;
    }
}

function Join( msgbus, msgs, method, opt ){
    opt = opt || {};
    this._data = {};
    this._listener = {};
    var notifier = createNotifier( method, opt.thisp ),
        _t = this, ln;
    
    this._handle = function(){
        for( var j = 0; j < msgs.length; j++ ){
            if( this._data[msgs[j]] === void 0 ) return;
        }
        notifier( this._data );
        if( opt.clean_after_fire ) this.clean();
    }
    
    for( var i = 0; i < msgs.length; i++ ){
        ln = msgbus.listen( msgs[i], (function(){
            var key = msgs[i];
            return function(val){
                _t.put( key, val );
            };
        })());
        _t._listener[ln._id] = ln;
    }
}
Join.prototype = {
    put: function( k, v ){
        this._data[k] = v;
        this._handle();
        return this;
    },
    clean: function(){
        this._data = {};
        return this;
    },
    remove: function(){
        for( var i in this._listener ){
            this._listener[i].remove();
        }
        return this;
    }
}

function createNotifier( method, obj ){
    if( typeof method === "string" && obj ){
        return function( data ){ obj[method]( data ) };
    }else if( typeof method === "function" && obj ){
        return function( data ){ method.call( obj, data ); };
    }else if( typeof method === "function" ){
        return function( data ){ method( data ); };
    }
    throw TypeError("Cannot create a listener.");
}

function fire( msg, data ){
    var lns = getListeners(msg), 
        now = new Date(), 
        opt, ln;
    for( var i in lns ){
        ln = lns[i];
        opt = ln._opt;
        if( opt.min_interval ){
            if( ln._lastCalled && (now - ln._lastCalled < opt.min_interval) ) continue;
            ln._lastCalled = now;
        }
        try{
            ln._handle( data );
        }catch( e ){
            opt.error && opt.error.call( opt.thisp || ln, e, data );
        }
    }
}

var msgbus= new MsgBus();
if( typeof module !== 'undefined' && module.exports ){
    module.exports = msgbus;
}else{
    var previous = window.MsgBus;
    MsgBus.prototype.noConflict = function(){
        window.MsgBus = previous;
        return msgbus;
    }
    window.MsgBus = msgbus;
}

})();
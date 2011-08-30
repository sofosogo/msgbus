(function(){

function MsgBus( prefix ){
    set[ this.prefix || "" ] = this;
    this.prefix = prefix ? prefix + "." : "";
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
        return getListeners(msg)[ln.id] = ln;
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
        var async = opt && opt.async !== void 0 ? opt.async : this.opt("async");
        this.prefix && ( msg = this.prefix + msg );
        if( !async ) fire( msg, data );
        else setTimeout( function(){fire(msg, data);}, 0 );
    },
    
    signal: function( msg, data, opt ){
        var msgWithPrefix = this.prefix ? this.prefix + msg : msg;
        return data !== void 0 ? this.fire(msg, signals[msgWithPrefix]=data, opt) : signals[msgWithPrefix];
    },
    
    opt: function( key, value ){
        return value !== void 0 ? (opt[key] = value) : opt[key];
    },
    
    getInstance: function( prefix ){
        if( set[prefix||""] ) return set[prefix||""];
        return new MsgBus( prefix );
    }
};

var id = 0, 
    listeners = {}, 
    signals = {}, 
    opt = { async: false }, 
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
    this.id = id++;
    this.msg = msg;
    this.opt = opt;
    this.notify = createNotifier( method, opt.thisp );
}
Listener.prototype = {
    handle: function( data ){
        if( this.enabled === false ){
            this._delay = function(){ this.notify( data ) };
        }else{
            this.notify( data );
        }
        if( this.opt.once ) this.remove();
    },
    remove: function(){
        delete getListeners(this.msg)[this.id];
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

function Join( msgbus, msgs, method, opt ){
    opt = opt || {};
    this.data = {};
    this.listener = {};
    var notifier = createNotifier( method, opt.thisp ),
        _t = this, ln;
    
    this.handle = function( data ){
        for( var j = 0; j < msgs.length; j++ ){
            if( data[msgs[j]] === void 0 ) return;
        }
        notifier( data );
        if( opt.clean_after_fire ) data = {};
    }
    
    for( var i = 0; i < msgs.length; i++ ){
        ln = msgbus.listen( msgs[i], (function(){
            var key = msgs[i];
            return function(val){
                _t.put( key, val );
            };
        })());
        _t.listener[ln.id] = ln;
    }
}
Join.prototype = {
    put: function( k, v ){
        this.data[k] = v;
        this.handle( this.data );
    },
    clean: function(){
        this.data = {};
    },
    remove: function(){
        for( var i in this.listener ){
            this.listener[i].remove();
        }
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
    var lns = getListeners(msg), now = new Date(), ln;
    for( var i in lns ){
        ln = lns[i];
        if( ln.opt.min_interval ){
            if( ln.lastCalled && (now - ln.lastCalled < ln.opt.min_interval) ) continue;
            ln.lastCalled = now;
        }
        try{
            ln.handle(data);
        }catch( e ){
        }
    }
}

window.MsgBus = new MsgBus();

})();
$(function() {
    
module("common.MsgBus");

test("listen", 3, function(){
    var event = "LISTEN";
    MsgBus.listen( "listen", function(data){ same(event, data);} );
    MsgBus.fire( "listen", event );
    same( MsgBus, MsgBus.getInstance() );
    same( MsgBus.getInstance("s"), MsgBus.getInstance("s") );
});

test("remove", 1, function(){
    var event = "REMOVE";
    var msgbus = MsgBus.getInstance(event);
    var listener = msgbus.listen( "listen", function(data){ same(event, data); } );
    msgbus.fire( "listen", event );
    listener.remove();
    msgbus.fire( "listen", event );
});

test("disable && enable", 2, function(){
    var num = 0;
    var event = "DISABLE";
    var msgbus = MsgBus.getInstance(event);
    var listener = msgbus.listen( "listen", function(data){ num++; } );
    msgbus.fire( "listen", event );
    listener.disable();
    msgbus.fire( "listen", event );
    equal( num, 1 );
    listener.enable();
    equal( num, 2 );
});

test("disable notify", 5, function(){
    var num = 0;
    var event = "DISABLE NOTIFY";
    var msgbus = MsgBus.getInstance(event);
    var listener = msgbus.listen( "listen", function(data){ num++; }, {enable: "VIEW.SHOW"} );
    equal( num, 0 );
    msgbus.fire( "listen", event );
    equal( num, 1 );
    msgbus.fire( "VIEW.SHOW", false );
    msgbus.fire( "listen", event );
    equal( num, 1 );
    msgbus.fire( "VIEW.SHOW", true );
    equal( num, 2 );
    msgbus.fire( "listen", event );
    equal( num, 3 );
});

test("option - once", 2, function(){
    var num = 0;
    var event = "ONCE";
    var msgbus = MsgBus.getInstance(event);
    var listener = msgbus.listen( "listen", function(data){ num++; }, {once: true} );
    msgbus.fire( "listen", event );
    equal( num, 1 );
    msgbus.fire( "listen", event );
    equal( num, 1 );
});

test("option - min_interval", 3, function(){
    var num = 0;
    var event = "min_interval";
    var msgbus = MsgBus.getInstance(event);
    var listener = msgbus.listen( "listen", function(data){ num++; }, {min_interval: 1000} );
    msgbus.fire( "listen", event );
    equal( num, 1 );
    msgbus.fire( "listen", event );
    equal( num, 1 );
    setTimeout(function(){ msgbus.fire("listen", event); equal(num, 2); start(); }, 1000 );
    stop();
});

test("signal", 2, function(){
    var event = "SIGNAL";
    var msgbus = MsgBus.getInstance(event);
    msgbus.listen( "signal", function(data){ same( event, data ); same( event, msgbus.signal("signal") ); } );
    msgbus.signal( "signal", event );
});

test("join", 3, function(){
    var event = "join";
    var msgbus = MsgBus.getInstance(event);
    var join = msgbus.join(["evt1", "evt2", "evt3"], function(data){ same(1, 1)});
    msgbus.fire("evt1", event)
        .fire("evt2", event)
        .fire("evt3", event) // once
        .fire("evt2", event + "_1"); // once
    
    join.clean();
    msgbus.fire("evt1", event + "_2");
    join.put("evt2", event + "_2");
    join.put("evt3", event + "_2"); // once
    
    join.remove();
    msgbus.fire("evt1", event + "_3")
        .fire("evt2", event + "_3")
        .fire("evt3", event + "_3");
});

test("error", 1, function(){
    var msgbus = MsgBus.getInstance("error");
    var ln = msgbus.listen("error", function( num ){
        if( typeof num !== "number" )
            throw TypeError("The parameter 'num' should be a number.");
    });
    msgbus.fire( "error", "1" ); // 0
    ln.error(function(e, data){
        window.console && console.log( e );
        same(1, 1);
    });
    msgbus.fire( "error", "1" ); // 1
    msgbus.fire( "error", 1 ); // 0
    ln.opt( "error", function(){} );
    msgbus.fire( "error", "1" ); // 0
});

test("noConflict", function(){
    var msgbus = MsgBus.noConflict();
    same( MsgBus, void 0 );
    same( msgbus, msgbus.getInstance() );
});

});
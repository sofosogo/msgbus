$(document).ready(function() {
    
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
    var listener = msgbus.listen( "listen", function(data){ num++; }, {min_interval: 50} );
    msgbus.fire( "listen", event );
    equal( num, 1 );
    msgbus.fire( "listen", event );
    equal( num, 1 );
    setTimeout(function(){ msgbus.fire("listen", event); equal(num, 2); start(); }, 100 );
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
    msgbus.fire("evt1", event);
    msgbus.fire("evt2", event);
    msgbus.fire("evt3", event); // once
    msgbus.fire("evt2", event + "_1"); // once
    
    join.clean();
    msgbus.fire("evt1", event + "_2");
    join.put("evt2", event + "_2");
    join.put("evt3", event + "_2"); // once
    
    join.remove();
    msgbus.fire("evt1", event + "_3");
    msgbus.fire("evt2", event + "_3");
    msgbus.fire("evt3", event + "_3");
});

test("noConflict", function(){
    var msgbus = MsgBus.noConflict();
    same( MsgBus, void 0 );
    same( msgbus, msgbus.getInstance() );
});

});
**﻿MsgBus名字源于Message Bus，意为消息总线。试图通过监听事件（MsgBus.listen）和触发事件（MsgBus.fire）将相关联的各个模块解耦。**  
# API：  
**MsgBus.listen( msg, method, opt )**  
@param msg: 字符串，必选。 监听的消息。  
@param method: 函数/字符串, 必选。收到消息后的动作。如果为字符串，必须在opt中指定thisp。  
@param opt: 对象，可选。比如{ thisp: XXObj, enable: "enable-msg", once: true } 所有可选参数。  
    thisp 对象，可选。第二个参数method的执行主体，如果method为字符串，则该参数必须指定。  
    enable 字符串，可选。这是一个信号，该信号改变时，会修改返回值listener的enabled属性。  
    once 布尔值，可选，缺省为false。如果为true，该监听只触发一次。  
    min_interval 整型（毫秒数）。两次触发之间最小的时间间隔。  
@return Listener，详见Listener。  
  
**MsgBus.wait( msg, method, opt )**  
该方法和msgbus.listen用法相同，只是设置了opt.once=true，使得该监听只会触发一次。  
  
**MsgBus.join( msgs, method, opt )**  
@param msgs: 数组，必选。 所有监听的消息。  
@param method: 函数/字符串, 必选。收到消息后的动作。如果为字符串，必须在opt中指定thisp。  
@param opt: 对象，可选。比如{ thisp: XXObj, clean_after_fire: true } 所有可选参数。  
    thisp 对象，可选。第二个参数method的执行主体，如果method为字符串，则该参数必须指定。  
    clean_after_fire 布尔值，可选，缺省为false。每次触发事件之后，是否清除所有已获得数据。  
@return Join，详见Join。  

**MsgBus.fire( msg, data, opt )**  
@param msg: string 监听的消息。  
@param data: 任意值。  
@param opt: 对象，可选。比如 {async: true}。  
    async 布尔值，可选。如值为true，使用setTimeout延迟触发该事件。  

**MsgBus.signal( msg, data, opt )**  
@param key 字符串，必选。所关注的信号。  
@param data 任意值，可选。如果data是undefined，将返回该信号，否则保存该信号并返回。此时用法和msgbus.fire相同。  
@param opt  对象，可选。比如 {async: true}。  
    async 布尔值，可选。如值为true，使用setTimeout延迟触发该事件。 
@return 如果参数只有msg，则返回该信号值，否则为undefined。  

**MsgBus.getInstance( prefix )**   
@param prefix 字符串。  
@return MsgBus  
主要起到隔离不同类型的消息的作用，拥有不同prefix的MsgBus可以监听和触发相同名字的消息，而互不影响。  
*注意：MsgBus === MsgBus.getInstance()恒成立。*

**MsgBus.global( key, value )**  
@param key 字符串，必选。全局属性。可选值async。  
    async表示未特别指定时，所有事件是否延迟触发。默认为false。  
@param value 任意值，可选。
@return 如果value是undefined，将返回该属性值，否则设置属性并返回MsgBus。  
设置MsgBus的全局属性，*注意该操作会影响到所有的MsgBus实例*。  

**Listener**  
表示一个监听器对象。有三个可以公开的方法。  
**Listener.remove()**  
删除该监听器。  
**Listener.disable()**  
禁用该监听器。 
当监听器禁用以后，每当收到消息，都不会触发，只是保存下来（仅仅保留最后一个消息）。  
**Listener.enable()**  
启用该监听器。  
如果有未处理的消息，则立即处理。  

**Join**  
Join意为结合点，和UML中的join概念相同。同时监听多条消息或者数据支流（亦可手动获取数据并通过Join.put方法来完成一支数据），
当所有的消息（数据）汇集完毕后，将会触发某种行为。  
**Join.put( k, v )**  
手动添加一支数据。  
**Join.clean()**  
手动清除所有已获得数据。  
**Join.remove()**  
删除该join。  

# Q && A

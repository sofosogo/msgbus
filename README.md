MsgBus����Դ��Message Bus����Ϊ��Ϣ���ߡ���ͼͨ�������¼���MsgBus.listen���ʹ����¼���MsgBus.fire����������ĸ���ģ����

API��
msgbus.listen( msg, method, opt )
@param msg: �ַ�������ѡ�� ��������Ϣ��
@param method: ����/�ַ���, ��ѡ���յ���Ϣ��Ķ��������Ϊ�ַ�����������opt��ָ��thisp��
@param opt: ���󣬿�ѡ������{ thisp: XXObj, enable: "enable-msg", once: true } ���п�ѡ������
    thisp ���󣬿�ѡ���ڶ�������method��ִ�����壬���methodΪ�ַ�������ò�������ָ����
    enable �ַ�������ѡ������һ���źţ����źŸı�ʱ�����޸ķ���ֵlistener��enabled���ԡ�
    once ����ֵ����ѡ��ȱʡΪfalse�����Ϊtrue���ü���ֻ����һ�Ρ�
    min_interval ���ͣ��������������δ���֮����С��ʱ������
@return listener Listener�����Listener��

msgbus.wait( msg, method, opt )
�÷�����msgbus.listen�÷���ͬ��ֻ��������opt.once=true��ʹ�øü���ֻ�ᴥ��һ�Σ���

msgbus.join( msgs, method, opt )
@param msgs: ���飬��ѡ�� ���м�������Ϣ��
@param method: ����/�ַ���, ��ѡ���յ���Ϣ��Ķ��������Ϊ�ַ�����������opt��ָ��thisp��
@param opt: ���󣬿�ѡ������{ thisp: XXObj, clean_after_fire: true } ���п�ѡ������
    thisp ���󣬿�ѡ���ڶ�������method��ִ�����壬���methodΪ�ַ�������ò�������ָ����
    clean_after_fire ����ֵ����ѡ��ȱʡΪfalse��ÿ�δ����¼�֮���Ƿ���������ѻ�����ݡ�
@return join Join�����Join��

msgbus.fire( msg, data, opt )
@param msg: string ��������Ϣ��
@param data: ����ֵ��
@param opt: ���󣬿�ѡ������ {async: true}��
    async ����ֵ����ѡ����ֵΪtrue��ʹ��setTimeout�ӳٴ������¼���

msgbus.signal( msg, data, opt )
@param key �ַ�������ѡ������ע���źš�
@param data ����ֵ����ѡ�����data��undefined�������ظ��źţ����򱣴���źŲ����ء���ʱ�÷���msgbus.fire��ͬ��
@param opt
msgbus.getInstance( prefix )
����MsgBus����һ��ʵ����
@param prefix �ַ�����

msgbus.opt( key, value )
@param key �ַ�������ѡ��ȫ�����ԡ���ѡֵasync��
    async��ʾδ�ر�ָ��ʱ�������¼��Ƿ��ӳٴ�����Ĭ��Ϊfalse��
@param value ����ֵ����ѡ�����value��undefined�������ظ�����ֵ�������������Բ����ء�
����MsgBus��ȫ�����ԣ�ע��ò�����Ӱ�쵽���е�MsgBusʵ����

Listener
��ʾһ���������������������Թ����ķ�����
listener.remove()
ɾ���ü�������
listener.disable()
��ͣ�ü�������
listener.enable()
���øü�������

Join
Join��Ϊ��ϵ㣬��UML��join�ĸ�����ͬ��
join.put( k, v )
�ֶ����һ֧���ݡ�
join.clean()
�ֶ���������ѻ�����ݡ�
join.remove()
ɾ����join��
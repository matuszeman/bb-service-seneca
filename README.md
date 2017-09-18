# bb-service-seneca

Seneca related service tools.

# Installation

```
npm install @kapitchi/bb-service-seneca
```

# Usage

TODO

# API

## Classes

<dl>
<dt><a href="#SenecaClient">SenecaClient</a></dt>
<dd><p>Seneca client</p>
</dd>
<dt><a href="#SenecaFactory">SenecaFactory</a></dt>
<dd><p>Seneca factory</p>
</dd>
<dt><a href="#SenecaServer">SenecaServer</a></dt>
<dd></dd>
</dl>

<a name="SenecaClient"></a>

## SenecaClient
Seneca client

**Kind**: global class  

* [SenecaClient](#SenecaClient)
    * [new SenecaClient(seneca)](#new_SenecaClient_new)
    * [.act(serviceName, method, params)](#SenecaClient+act) ⇒ <code>Promise</code>

<a name="new_SenecaClient_new"></a>

### new SenecaClient(seneca)

| Param | Type |
| --- | --- |
| seneca | <code>Seneca</code> | 

<a name="SenecaClient+act"></a>

### senecaClient.act(serviceName, method, params) ⇒ <code>Promise</code>
Calls seneca.act() with action pattern:

 - bbservice - serviceName
 - bbmethod - method

Args object is merged with bbservice/bbmethod seneca pattern object.

**Kind**: instance method of <code>[SenecaClient](#SenecaClient)</code>  

| Param | Type |
| --- | --- |
| serviceName | <code>string</code> | 
| method | <code>string</code> | 
| params | <code>Object</code> | 

<a name="SenecaFactory"></a>

## SenecaFactory
Seneca factory

**Kind**: global class  

* [SenecaFactory](#SenecaFactory)
    * [.createProxyServices(config, senecaClient)](#SenecaFactory.createProxyServices) ⇒ <code>Object</code>
    * [.createProxyService(serviceName, senecaClient, opts)](#SenecaFactory.createProxyService) ⇒ <code>Object</code> &#124; <code>Proxy</code>
    * [.createPlugin(obj, opts)](#SenecaFactory.createPlugin) ⇒ <code>function</code>

<a name="SenecaFactory.createProxyServices"></a>

### SenecaFactory.createProxyServices(config, senecaClient) ⇒ <code>Object</code>
TODO

**Kind**: static method of <code>[SenecaFactory](#SenecaFactory)</code>  
**Returns**: <code>Object</code> - Proxy services created  

| Param | Type |
| --- | --- |
| config | <code>Object</code> | 
| senecaClient | <code>[SenecaClient](#SenecaClient)</code> | 

<a name="SenecaFactory.createProxyService"></a>

### SenecaFactory.createProxyService(serviceName, senecaClient, opts) ⇒ <code>Object</code> &#124; <code>Proxy</code>
Creates local-like service proxying to seneca client

If used in environment where Proxy class is not available define `opts.methods` parameter.
This creates plain object with methods defined instead of using Proxy.

**Kind**: static method of <code>[SenecaFactory](#SenecaFactory)</code>  

| Param | Type | Description |
| --- | --- | --- |
| serviceName | <code>string</code> |  |
| senecaClient | <code>[SenecaClient](#SenecaClient)</code> |  |
| opts | <code>Object</code> |  |
| [opts.methods] | <code>Array</code> | Array of methods to proxy (creates plain object instead of using Proxy) |

<a name="SenecaFactory.createPlugin"></a>

### SenecaFactory.createPlugin(obj, opts) ⇒ <code>function</code>
Creates seneca plugin from the service class instance

Exposes each service method with action pattern:

 - bbservice - service name
 - bbmethod - method name

**Kind**: static method of <code>[SenecaFactory](#SenecaFactory)</code>  
**Returns**: <code>function</code> - Seneca plugin  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | Service instance |
| opts | <code>Object</code> |  |
| opts.methods | <code>Array</code> | Service methods to expose |
| [opts.service] | <code>string</code> | Service name (default: object's constructor name) |
| [opts.pluginName] | <code>string</code> | Seneca plugin name (default: service name) |
| [opts.initMethod] | <code>string</code> | Register service method as Seneca initialization action http://senecajs.org/docs/tutorials/how-to-write-a-plugin.html#wp-init |
| [opts.logger] | <code>Object</code> | Logger { log: fn } |

<a name="SenecaServer"></a>

## SenecaServer
**Kind**: global class  

* [SenecaServer](#SenecaServer)
    * [new SenecaServer(senecaServerOpts, senecaServerExposedServices)](#new_SenecaServer_new)
    * [.listen()](#SenecaServer+listen) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_SenecaServer_new"></a>

### new SenecaServer(senecaServerOpts, senecaServerExposedServices)

| Param | Type | Description |
| --- | --- | --- |
| senecaServerOpts | <code>Object</code> |  |
| senecaServerOpts.port | <code>number</code> |  |
| senecaServerOpts.params | <code>Object</code> | Seneca params |
| senecaServerExposedServices | <code>Object</code> | Services to expose |

**Example**  
```js
const server = new SenecaServer({
 port: 8080
}, {
 myService: {
   instance: myServiceImp //service object
   methods: ['firstMethod', 'otherMethod']
 }
})
```
<a name="SenecaServer+listen"></a>

### senecaServer.listen() ⇒ <code>Promise.&lt;void&gt;</code>
Start seneca server

**Kind**: instance method of <code>[SenecaServer](#SenecaServer)</code>  

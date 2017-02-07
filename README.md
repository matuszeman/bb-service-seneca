# bb-service-seneca

Seneca related service tools.

# Installation

```
npm install matuszeman/bb-service-seneca
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
</dl>

<a name="SenecaClient"></a>

## SenecaClient
Seneca client

**Kind**: global class  

* [SenecaClient](#SenecaClient)
    * [new SenecaClient(seneca)](#new_SenecaClient_new)
    * [.act(role, cmd, args)](#SenecaClient+act) ⇒ <code>Promise</code>

<a name="new_SenecaClient_new"></a>

### new SenecaClient(seneca)

| Param | Type |
| --- | --- |
| seneca | <code>Seneca</code> | 

<a name="SenecaClient+act"></a>

### senecaClient.act(role, cmd, args) ⇒ <code>Promise</code>
Calls seneca.act()

**Kind**: instance method of <code>[SenecaClient](#SenecaClient)</code>  

| Param | Type |
| --- | --- |
| role | <code>string</code> | 
| cmd | <code>string</code> | 
| args | <code>Object</code> | 

<a name="SenecaFactory"></a>

## SenecaFactory
Seneca factory

**Kind**: global class  

* [SenecaFactory](#SenecaFactory)
    * [.createProxyService(role, senecaClient)](#SenecaFactory.createProxyService) ⇒ <code>Proxy</code>
    * [.createPlugin(service, opts)](#SenecaFactory.createPlugin) ⇒ <code>function</code>

<a name="SenecaFactory.createProxyService"></a>

### SenecaFactory.createProxyService(role, senecaClient) ⇒ <code>Proxy</code>
Creates local-like service proxying to seneca client

**Kind**: static method of <code>[SenecaFactory](#SenecaFactory)</code>  

| Param | Type |
| --- | --- |
| role | <code>string</code> | 
| senecaClient | <code>[SenecaClient](#SenecaClient)</code> | 

<a name="SenecaFactory.createPlugin"></a>

### SenecaFactory.createPlugin(service, opts) ⇒ <code>function</code>
Creates seneca plugin from the service class instance

**Kind**: static method of <code>[SenecaFactory](#SenecaFactory)</code>  
**Returns**: <code>function</code> - Seneca plugin  

| Param | Type |
| --- | --- |
| service | <code>Object</code> | 
| opts | <code>Object</code> | 


(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/nuro/compiled/util/object-utils.js
  function zip(xs, ys) {
    const zipped = [];
    for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
      let pair = {
        left: xs[i],
        right: ys[i]
      };
      zipped.push(pair);
    }
    return zipped;
  }
  function getMethodNames(Class) {
    return Object.getOwnPropertyNames(Class.prototype).filter((x) => x !== "constructor");
  }
  function isObject(val) {
    return Object.prototype.toString.call(val) === "[object Object]";
  }
  function isFunction(val) {
    return Object.prototype.toString.call(val) === "[object Function]";
  }
  function isArray(val) {
    return Array.isArray(val);
  }

  // node_modules/nuro/compiled/components/create-element.js
  function createElementFactory(includes) {
    return function(type, props = {}, children = []) {
      if (!isArray(children)) {
        children = [children];
      }
      let nodeType;
      let tag;
      let componentClass;
      if (typeof type == "function") {
        nodeType = "component";
        tag = "";
        componentClass = type;
      } else if (includes.has(type)) {
        nodeType = "component";
        tag = "";
        componentClass = includes.get(type);
      } else {
        nodeType = "element";
        tag = type;
      }
      let vNode = {
        nodeType,
        tag,
        text: "",
        attrs: props,
        children: [],
        componentClass
      };
      vNode.children = children.map((child) => {
        if (isVNode(child)) {
          return child;
        } else {
          return {
            nodeType: "text",
            tag: "",
            text: child,
            attrs: {},
            children: []
          };
        }
      });
      return vNode;
    };
  }
  function isVNode(child) {
    return child != null && child.nodeType !== void 0;
  }

  // node_modules/nuro/compiled/util/nuro-error.js
  var NuroError = class extends Error {
    constructor(message) {
      super(message);
    }
  };

  // node_modules/nuro/compiled/dom/diff-engine.js
  var DiffEngine = class {
    constructor(domPatcher2) {
      this.domPatcher = domPatcher2;
    }
    reconcile(element2, vOldNode, vNewNode) {
      let patch = this.createPatchFunction(vOldNode, vNewNode);
      let newElement = patch(element2);
      if (newElement) {
        return newElement;
      } else {
        throw new NuroError("Patch function did not return an element");
      }
    }
    createPatchFunction(vOldNode, vNewNode) {
      return this.diffNodes(vOldNode, vNewNode);
    }
    diffNodes(vOldNode, vNewNode) {
      if (!vNewNode) {
        return (node) => this.domPatcher.removeNode(node);
      }
      if ((vOldNode.nodeType === "text" || vNewNode.nodeType === "text") && (vNewNode.text !== vOldNode.text || vOldNode.nodeType !== "text" || vNewNode.nodeType !== "text")) {
        return (node) => this.domPatcher.replaceNode(node, vNewNode);
      }
      if (vNewNode.nodeType === "component") {
        if (vOldNode.componentClass !== vNewNode.componentClass) {
          return (node) => this.domPatcher.mountComponentOnNode(node, vOldNode, vNewNode);
        } else {
          const props = vNewNode.attrs;
          props.children = vNewNode.children;
          return (node) => this.domPatcher.setComponentPropsOnNode(node, props);
        }
      }
      if (vOldNode.tag !== vNewNode.tag) {
        return (node) => {
          if (vOldNode.nodeType === "component") {
            this.domPatcher.unmountComponentOnNode(node);
          }
          return this.domPatcher.replaceNode(node, vNewNode);
        };
      }
      let patchAttrs = this.diffAttributes(vOldNode.attrs, vNewNode.attrs);
      const patchChildren = this.diffChildren(vOldNode.children, vNewNode.children);
      return (node) => {
        patchAttrs(node);
        patchChildren(node);
        return node;
      };
    }
    diffAttributes(vOldAttrs, vNewAttrs) {
      let patches = [];
      for (const [vNewAttrName, vNewAttrValue] of Object.entries(vNewAttrs)) {
        patches.push((node) => {
          this.domPatcher.setAttribute(node, vNewAttrName, vNewAttrValue);
          return node;
        });
      }
      for (const vOldAttrName in vOldAttrs) {
        if (!(vOldAttrName in vNewAttrs) || vNewAttrs[vOldAttrName] == null) {
          patches.push((node) => {
            this.domPatcher.removeAttribute(node, vOldAttrName);
            return node;
          });
        }
      }
      return (node) => {
        for (const patch of patches) {
          patch(node);
        }
        return node;
      };
    }
    diffChildren(vOldChildren = [], vNewChildren = []) {
      const childPatches = [];
      vOldChildren.forEach((vOldChild, i) => {
        childPatches.push(this.diffNodes(vOldChild, vNewChildren[i]));
      });
      const additionalPatches = [];
      for (const additionalVChild of vNewChildren.slice(vOldChildren.length)) {
        additionalPatches.push((parent) => this.domPatcher.appendChildNode(parent, additionalVChild));
      }
      return (parent) => {
        if (childPatches.length !== parent.childNodes.length) {
          throw new NuroError("Actual child nodes in DOM does not match number of child patches");
        }
        let patchChildNodesPairs = zip(childPatches, parent.childNodes);
        for (const pair of patchChildNodesPairs) {
          const patch = pair.left;
          const child = pair.right;
          patch(child);
        }
        for (const patch of additionalPatches) {
          patch(parent);
        }
        return parent;
      };
    }
  };

  // node_modules/nuro/compiled/dom/map-vnode.js
  function mapVNode(rootNode, includeComments = true) {
    return createVNode(rootNode, includeComments);
  }
  function createVNode(node, includeComments) {
    if (node.nodeType === 1) {
      let vNode = {
        nodeType: "element",
        tag: node.tagName.toLowerCase(),
        text: "",
        attrs: {},
        children: []
      };
      Array.prototype.forEach.call(node.attributes, (attr) => {
        vNode.attrs[attr.name] = attr.value;
      });
      vNode.children = createChildren(node.childNodes, includeComments);
      return vNode;
    } else {
      return {
        nodeType: node.nodeType === 8 ? "comment" : "text",
        text: node.textContent || "",
        tag: "",
        attrs: {},
        children: []
      };
    }
  }
  function createChildren(children, includeComments) {
    let vChildren = [];
    Array.prototype.forEach.call(children, (child) => {
      if (includeComments || child.nodeType !== 8) {
        let vNode = createVNode(child, includeComments);
        vChildren.push(vNode);
      }
    });
    return vChildren;
  }

  // node_modules/nuro/compiled/dom/node-context.js
  function getOrCreateNodeContext(node) {
    if (!node._nuro) {
      node._nuro = {
        eventHandlers: {}
      };
    }
    return node._nuro;
  }
  function setEventHandler(node, eventType, handler) {
    let nodeContext = getOrCreateNodeContext(node);
    let existingHandler = nodeContext.eventHandlers[eventType];
    if (existingHandler) {
      if (existingHandler !== handler) {
        node.removeEventListener(eventType, existingHandler);
        node.addEventListener(eventType, handler);
        nodeContext.eventHandlers[eventType] = handler;
      }
    } else {
      node.addEventListener(eventType, handler);
      nodeContext.eventHandlers[eventType] = handler;
    }
  }
  function removeEventHandler(node, eventType) {
    let nodeContext = getOrCreateNodeContext(node);
    node.removeEventListener(eventType, nodeContext.eventHandlers[eventType]);
    delete nodeContext.eventHandlers[eventType];
  }
  function setComponentProxy(node, componentProxy) {
    let nodeContext = getOrCreateNodeContext(node);
    nodeContext.component = componentProxy;
  }
  function getComponentProxy(node) {
    let nodeContext = getOrCreateNodeContext(node);
    if (nodeContext.component) {
      return nodeContext.component;
    } else {
      throw new NuroError("Element does not have component inside context object");
    }
  }
  function hasComponentProxy(node) {
    return node._nuro != null && node._nuro.component != null;
  }
  function deleteNodeContext(node) {
    delete node._nuro;
  }

  // node_modules/nuro/compiled/dom/dom-patcher.js
  var DomPatcher = class {
    constructor(mountComponent2, unmountComponent2, setProps2) {
      this.mountComponent = mountComponent2;
      this.unmountComponent = unmountComponent2;
      this.setProps = setProps2;
    }
    removeNode(node) {
      node.remove();
    }
    replaceNode(node, vNewNode) {
      let newNode = this.createNode(vNewNode);
      this.unmountComponent(node);
      node.replaceWith(newNode);
      return newNode;
    }
    appendChildNode(node, vChildNode) {
      node.appendChild(this.createNode(vChildNode));
      return node;
    }
    mountComponentOnNode(node, vOldNode, vNewNode) {
      if (vNewNode.componentClass) {
        this.unmountComponent(node);
        return this.mountComponent(vNewNode.componentClass, node, vNewNode.attrs, vNewNode.children, vOldNode);
      } else {
        throw new NuroError("Component class is required for component node type");
      }
    }
    setComponentPropsOnNode(node, props) {
      return this.setProps(node, props);
    }
    unmountComponentOnNode(node) {
      this.unmountComponent(node);
    }
    createNode(vNode, isSVG = false) {
      let node;
      isSVG = isSVG || vNode.tag === "svg";
      if (vNode.nodeType === "component") {
        if (vNode.componentClass) {
          let tempDiv = document.createElement("div");
          let vOldNode = mapVNode(tempDiv);
          node = this.mountComponent(vNode.componentClass, tempDiv, vNode.attrs, vNode.children, vOldNode);
        } else {
          throw new NuroError("Component class is required for component node type");
        }
      } else if (vNode.nodeType === "text") {
        node = document.createTextNode(vNode.text);
      } else if (isSVG) {
        node = document.createElementNS("http://www.w3.org/2000/svg", vNode.tag);
      } else {
        node = document.createElement(vNode.tag);
      }
      if (vNode.nodeType !== "component") {
        for (let [name, value] of Object.entries(vNode.attrs)) {
          this.setAttribute(node, name, value);
        }
        vNode.children.forEach((vNodeChild) => {
          let createdNode = this.createNode(vNodeChild, isSVG);
          node.appendChild(createdNode);
        });
      }
      return node;
    }
    setAttribute(node, attrName, attrValue) {
      if (attrName === "checked") {
        let inputNode = node;
        inputNode.checked = !!attrValue;
      }
      if (attrValue != null) {
        if (attrName.startsWith("@")) {
          if (isFunction(attrValue)) {
            setEventHandler(node, attrName.substring(1), attrValue);
          } else {
            throw new NuroError("Event handler must be a function");
          }
        } else if (node.getAttribute(attrName) !== attrValue) {
          node.setAttribute(attrName, attrValue);
        }
      }
    }
    removeAttribute(node, attrName) {
      if (attrName.startsWith("@")) {
        removeEventHandler(node, attrName.substring(1));
      } else {
        node.removeAttribute(attrName);
      }
    }
    createElementInBody(tagName) {
      let element2 = document.createElement(tagName);
      document.body.appendChild(element2);
      return element2;
    }
  };

  // node_modules/nuro/compiled/components/proxy-handler.js
  function createComponentProxy(component) {
    return new Proxy(component, proxyHandler);
  }
  var proxyHandler = {
    get: handleGet,
    set: handleSet,
    deleteProperty: handleDelete
  };
  function handleGet(obj, prop) {
    let val = obj[prop];
    if (isObject(val) || isArray(val)) {
      if (prop === "props" && !obj.$component) {
        return val;
      }
      if (prop.startsWith("$")) {
        return val;
      }
      val.$component = getComponent(obj);
      if (isArray(val)) {
        val.forEach((element2) => {
          if (isObject(element2)) {
            element2.$component = getComponent(obj);
          }
        });
      }
      return new Proxy(val, proxyHandler);
    } else {
      return val;
    }
  }
  function handleSet(obj, prop, value) {
    obj[prop] = value;
    let component = getComponent(obj);
    if (prop === "props") {
      component.$vnode.attrs = value;
    }
    component.$update();
    return true;
  }
  function handleDelete(obj, prop) {
    delete obj[prop];
    let component = getComponent(obj);
    component.$update();
    return true;
  }
  function getComponent(obj) {
    return obj.$component != null ? obj.$component : obj;
  }

  // node_modules/nuro/compiled/components/hooks.js
  function callHook(component, hookName) {
    if (component[hookName]) {
      component[hookName]();
    }
  }

  // node_modules/nuro/compiled/dom/html-to-dom.js
  function htmlToDom(html) {
    let document2 = new DOMParser().parseFromString(html, "text/html");
    let wrapperNode = document2.body;
    return wrapperNode.children[0];
  }

  // node_modules/nuro/compiled/components/template-compiler.js
  var cache = new Map();
  function compileTemplate(template) {
    let cachedCode = cache.get(template);
    if (cachedCode) {
      return cachedCode;
    }
    let node = htmlToDom(template);
    let vNode = mapVNode(node, false);
    let code = "with(this){return " + compileNode(vNode) + "}";
    cache.set(template, code);
    return code;
  }
  function compileNode(vNode) {
    if (vNode.nodeType === "text") {
      let text = vNode.text.replace(/\n/g, "\\n");
      text = compileText(text);
      return text;
    } else {
      if (vNode.attrs.$if !== void 0) {
        return compileIfDirective(vNode);
      } else if (vNode.attrs.$for !== void 0) {
        return compileForDirective(vNode);
      } else if (vNode.tag === "slot") {
        return compileSlot();
      } else {
        return compileElement(vNode);
      }
    }
  }
  function compileElement(vNode) {
    let code = "h(";
    code += "'" + vNode.tag + "'";
    let compiledAttrs = new Map();
    for (let [key, value] of Object.entries(vNode.attrs)) {
      if (key.startsWith("$")) {
        continue;
      }
      if (key.startsWith(":")) {
        key = key.substr(1);
      } else if (key.startsWith("@")) {
      } else {
        value = compileText(value);
      }
      compiledAttrs.set(key, value);
    }
    if (vNode.attrs.$class) {
      let staticClassValue = compiledAttrs.has("class") ? compiledAttrs.get("class") : "''";
      let classExpressionCode = `Object.entries(${vNode.attrs.$class}).reduce((prevC,c)=>c[1]?prevC+=" "+c[0]:prevC,${staticClassValue}).trim()`;
      compiledAttrs.set("class", classExpressionCode);
    }
    if (vNode.attrs.$bind) {
      const tag = vNode.tag;
      const type = vNode.attrs.type;
      let propAndEvent;
      if (tag === "input" && type === "checkbox") {
        propAndEvent = { prop: "checked", event: "change" };
      } else if (tag === "input") {
        propAndEvent = { prop: "value", event: "input" };
      } else if (tag === "textarea") {
        propAndEvent = { prop: "value", event: "input" };
      } else if (tag === "select") {
        propAndEvent = { prop: "value", event: "change" };
      }
      if (propAndEvent) {
        compiledAttrs.set(propAndEvent.prop, vNode.attrs.$bind);
        compiledAttrs.set("@" + propAndEvent.event, `(e)=>{this.$update({${vNode.attrs.$bind}:e.target.${propAndEvent.prop}})}`);
      }
    }
    let attrsObjectCode = "{" + Array.from(compiledAttrs).map(([key, value]) => `'${key}':${value}`).join(",") + "}";
    if (vNode.attrs.$attrs) {
      let attrs = attrsObjectCode;
      let newAttrs = vNode.attrs.$attrs;
      attrsObjectCode = `{...${attrs},...${newAttrs},...{class:(${attrs}.class?(${attrs}.class+' '+(${newAttrs}.class||'')).trim():${newAttrs}.class)}}`;
    }
    code += "," + attrsObjectCode;
    if (vNode.children.length > 0) {
      let children = [];
      vNode.children.forEach((vChild) => {
        if (vChild.nodeType === "text" && vChild.text.trim() === "") {
          return;
        }
        let childCode = compileNode(vChild);
        children.push(childCode);
      });
      let joinedChildren = children.join(",");
      code += ",[" + joinedChildren + "]";
    }
    code += ")";
    return code;
  }
  function compileIfDirective(vNode) {
    let ifValue = vNode.attrs.$if;
    delete vNode.attrs.$if;
    return `(${ifValue})?${compileElement(vNode)}:''`;
  }
  function compileForDirective(vNode) {
    let forValue = vNode.attrs.$for;
    delete vNode.attrs.$for;
    let forValueSplit = forValue.trim().split(" in ");
    let elementName = forValueSplit[0];
    let arrayName = forValueSplit[1];
    return `...${arrayName}.map((${elementName})=>${compileNode(vNode)})`;
  }
  function compileSlot() {
    return "...props.children";
  }
  function compileText(text) {
    if (text.length < 5) {
      return "'" + text + "'";
    }
    let inExpression = false;
    let expression = "";
    let output = "";
    if (text.charAt(0) !== "{" || text.charAt(1) !== "{") {
      output += "'";
    }
    let char, nextChar;
    for (let i = 0; i < text.length; i++) {
      char = text.charAt(i);
      nextChar = text.length > i ? text.charAt(i + 1) : false;
      if (char === "{" && nextChar && nextChar === "{") {
        if (i !== 0) {
          output += "'+";
        }
        output += "(";
        i++;
        inExpression = true;
      } else if (char === "}") {
        i++;
        output += expression + ")";
        inExpression = false;
        expression = "";
        if (i !== text.length - 1) {
          output += "+'";
        }
      } else if (inExpression) {
        expression += char;
      } else {
        output += char;
      }
    }
    if (char !== "'" && char !== "}") {
      output += "'";
    }
    return output;
  }

  // node_modules/nuro/compiled/util/string-utils.js
  function camelCaseToKebabCase(camelCase) {
    return camelCase.split("").map((char, i) => {
      if (isLetter(char) && char === char.toUpperCase()) {
        if (i === 0) {
          return char.toLowerCase();
        } else {
          return "-" + char.toLowerCase();
        }
      } else {
        return char;
      }
    }).join("");
  }
  function isLetter(character) {
    return character.length === 1 && character.toLowerCase() != character.toUpperCase();
  }

  // node_modules/nuro/compiled/components/register.js
  var globalIncludes = new Map();
  function register(componentName, ComponentClass) {
    globalIncludes.set(camelCaseToKebabCase(componentName), ComponentClass);
  }

  // node_modules/nuro/compiled/components/mixins.js
  var mixins = [];
  function addMixin(mixin) {
    mixins.push(mixin);
  }
  function applyMixins(component) {
    mixins.forEach((mixin) => {
      Object.keys(mixin).forEach((prop) => {
        component[prop] = mixin[prop];
      });
    });
  }

  // node_modules/nuro/compiled/components/component-handler.js
  var domPatcher = new DomPatcher(mountComponent, unmountComponent, setProps);
  function mountRootComponent(ComponentClass, element2, props = {}) {
    if (!element2) {
      element2 = domPatcher.createElementInBody("div");
    }
    let vOldNode = mapVNode(element2);
    let newNode = mountComponent(ComponentClass, element2, props, [], vOldNode);
    return getComponentProxy(newNode);
  }
  function mountComponent(ComponentClass, element2, props, children, vOldNode) {
    let component = new ComponentClass(props);
    callHook(component, "beforeInit");
    applyMixins(component);
    let localIncludes = component.includes || {};
    component.includes = getComponentIncludes(localIncludes, globalIncludes);
    if (!component.render) {
      if (component.template) {
        let renderMethodCode = compileTemplate(component.template);
        component.render = new Function("h", renderMethodCode);
      } else {
        throw new NuroError("Either a render method or a template string is required in a component class");
      }
    }
    component.$element = element2;
    component.$vnode = vOldNode;
    component.props = props;
    component.props.children = children;
    let componentProxy = createComponentProxy(component);
    component.$update = function(newData) {
      if (newData && isObject(newData)) {
        Object.assign(component, newData);
      }
      updateComponent(component);
    };
    bindAllMethods(component, componentProxy, ComponentClass);
    callHook(componentProxy, "beforeMount");
    updateComponent(component);
    callHook(componentProxy, "afterMount");
    setComponentProxy(component.$element, componentProxy);
    return component.$element;
  }
  function getComponentIncludes(classIncludes, globalIncludes2) {
    let includes = new Map([...globalIncludes2]);
    for (let originalName in classIncludes) {
      let componentClass = classIncludes[originalName];
      let kebabName = camelCaseToKebabCase(originalName);
      includes.set(originalName, componentClass);
      includes.set(kebabName, componentClass);
    }
    return includes;
  }
  function bindAllMethods(component, componentProxy, ComponentClass) {
    getMethodNames(ComponentClass).forEach((method) => {
      component[method] = component[method].bind(componentProxy);
    });
  }
  function unmountComponent(element2) {
    if (element2 != null && hasComponentProxy(element2)) {
      let component = getComponentProxy(element2);
      callHookRecursively(component.$element, "beforeUnmount");
      deleteNodeContext(element2);
      return true;
    } else {
      return false;
    }
  }
  function callHookRecursively(element2, hook) {
    Array.from(element2.children).forEach((child) => {
      callHookRecursively(child, hook);
    });
    if (hasComponentProxy(element2)) {
      let component = getComponentProxy(element2);
      callHook(component, hook);
    }
  }
  function updateComponent(component) {
    callHook(component, "beforeRender");
    let createElement = createElementFactory(component.includes);
    let newVNode = component.render(createElement);
    if (!newVNode.nodeType) {
      throw new NuroError("Component render method did not return VNode");
    }
    let diffEngine = new DiffEngine(domPatcher);
    let newNode = diffEngine.reconcile(component.$element, component.$vnode, newVNode);
    callHook(component, "afterRender");
    component.$vnode = newVNode;
    component.$element = newNode;
    return component;
  }
  function setProps(node, props) {
    let componentProxy = getComponentProxy(node);
    componentProxy.props = props;
    return node;
  }

  // node_modules/nuro/compiled/components/plugins.js
  var installedPlugins = [];
  function installPlugin(plugin, options) {
    if (!installedPlugins.includes(plugin)) {
      plugin.install(this, options);
      installedPlugins.push(plugin);
    }
  }

  // node_modules/nuro/compiled/api/component.js
  var UserComponent = class {
    constructor(props) {
      this.props = props;
    }
    beforeInit() {
    }
    beforeMount() {
    }
    afterMount() {
    }
    beforeRender() {
    }
    afterRender() {
    }
    beforeUnmount() {
    }
  };

  // node_modules/nuro/compiled/index.js
  var globalAPI = {
    mount: mountRootComponent,
    unmount: unmountComponent,
    compileTemplate,
    include: register,
    register,
    mixin: addMixin,
    install: installPlugin
  };

  // node_modules/nuro-router/build/compiled/routers/browser-history-router.js
  var BrowserHistoryRouter = class {
    constructor() {
      this.params = {};
      this.subscriptions = [];
      this.navigateWithJS = true;
      window.addEventListener("popstate", () => {
        const newPath = this.getCurrentPath();
        this.publishPathChange(newPath);
      });
    }
    goTo(newPath) {
      if (newPath) {
        window.history.pushState(null, "", newPath);
        this.publishPathChange(newPath);
      }
    }
    publishPathChange(newPath) {
      this.subscriptions.forEach((callback) => {
        callback(newPath);
      });
    }
    getCurrentPath() {
      return window.location.pathname;
    }
    subscribeToPathChange(pathChangeCallback) {
      this.subscriptions.push(pathChangeCallback);
    }
    unsubscribeToPathChange(pathChangeCallback) {
      const index = this.subscriptions.indexOf(pathChangeCallback);
      if (index > -1) {
        this.subscriptions.splice(index, 1);
      }
    }
  };

  // node_modules/nuro-router/build/compiled/components/router-link.js
  var RouterLink = class {
    render(createElement) {
      const anchorProps = Object.assign({}, this.props);
      delete anchorProps.to;
      delete anchorProps.children;
      anchorProps["href"] = this.props.to;
      if (this.$router.navigateWithJS) {
        anchorProps["@click"] = this.handleClick;
      }
      return createElement("a", anchorProps, this.props.children);
    }
    handleClick(event) {
      event.preventDefault();
      this.$router.goTo(this.props.to);
    }
  };

  // node_modules/nuro-router/build/compiled/util/match.js
  function match(actualSegments, routeSegments) {
    if (!routeSegments) {
      return {
        isMatch: false,
        params: {}
      };
    }
    let isMatch = true;
    const params = {};
    const greaterLength = actualSegments.length > routeSegments.length ? actualSegments.length : routeSegments.length;
    for (let i = 0; i < greaterLength; i++) {
      const actualSegment = actualSegments.length > i ? actualSegments[i] : null;
      const routeSegment = routeSegments.length > i ? routeSegments[i] : null;
      if (actualSegment === null || routeSegment === null) {
        isMatch = false;
        break;
      }
      if (routeSegment.startsWith(":") && routeSegment.length > 1) {
        const paramName = routeSegment.substring(1, routeSegment.length);
        params[paramName] = actualSegment;
      } else if (routeSegment !== actualSegment) {
        isMatch = false;
        break;
      }
    }
    return {
      isMatch,
      params
    };
  }

  // node_modules/nuro-router/build/compiled/util/segments.js
  function parseSegments(path) {
    if (!path || path.length < 2) {
      return [];
    }
    let pathWithoutLeadingSlash = path;
    if (path.startsWith("/")) {
      pathWithoutLeadingSlash = path.substring(1, path.length);
    }
    return pathWithoutLeadingSlash.split("/");
  }

  // node_modules/nuro-router/build/compiled/components/router-switch.js
  var RouterSwitch = class {
    constructor() {
      this.currentPath = "";
    }
    render(createElement) {
      let routes = [];
      if (this.props.routes) {
        routes = this.props.routes;
      } else if (this.routes) {
        routes = this.routes;
      }
      const pathSegments = parseSegments(this.currentPath);
      let routeParams = {};
      let defaultRoute;
      let matchingRoute;
      matchingRoute = routes.find((route) => {
        if (route.path === "*") {
          defaultRoute = route;
        }
        const routeSegments = parseSegments(route.path);
        const matchResult = match(pathSegments, routeSegments);
        if (matchResult.isMatch) {
          routeParams = matchResult.params;
          return true;
        }
      });
      if (matchingRoute == null && defaultRoute != null) {
        return createComponent(createElement, defaultRoute, routeParams);
      }
      if (!matchingRoute) {
        return createElement("div");
      }
      return createComponent(createElement, matchingRoute, routeParams);
    }
    changePath(newPath) {
      this.currentPath = newPath;
    }
    beforeMount() {
      this.currentPath = this.$router.getCurrentPath();
      this.$router.subscribeToPathChange(this.changePath);
    }
    beforeUnmount() {
      this.$router.unsubscribeToPathChange(this.changePath);
    }
  };
  function createComponent(createElement, route, params) {
    return createElement(route.component, {
      routeParams: params
    });
  }

  // node_modules/nuro-router/build/compiled/routers/hard-refresh-router.js
  var HardRefreshRouter = class {
    constructor() {
      this.params = {};
      this.navigateWithJS = false;
    }
    goTo(newPath) {
      if (newPath) {
        window.location.href = newPath;
      }
    }
    getCurrentPath() {
      return window.location.pathname;
    }
    subscribeToPathChange(pathChangeCallback) {
    }
    unsubscribeToPathChange(pathChangeCallback) {
    }
  };

  // node_modules/nuro-router/build/compiled/index.js
  var NuroRouter = {
    install(Nuro, options) {
      const router = getRouterImplementation(options);
      Nuro.mixin({
        $router: router
      });
      Nuro.include("router-switch", RouterSwitch);
      Nuro.include("router-link", RouterLink);
    }
  };
  function getRouterImplementation(options) {
    let router = null;
    if ((options === null || options === void 0 ? void 0 : options.mode) === "browser-history") {
      router = new BrowserHistoryRouter();
    } else if ((options === null || options === void 0 ? void 0 : options.mode) == "hard-refresh") {
      router = new HardRefreshRouter();
    }
    if (router === null) {
      router = new HardRefreshRouter();
    }
    return router;
  }

  // src/client/base-component.ts
  var BaseComponent = class extends UserComponent {
  };

  // src/model/stages.ts
  var stageMultiplierMap = new Map();
  stageMultiplierMap.set(-6, 2 / 8);
  stageMultiplierMap.set(-5, 2 / 7);
  stageMultiplierMap.set(-4, 2 / 6);
  stageMultiplierMap.set(-3, 2 / 5);
  stageMultiplierMap.set(-2, 2 / 4);
  stageMultiplierMap.set(-1, 2 / 3);
  stageMultiplierMap.set(0, 2 / 2);
  stageMultiplierMap.set(1, 3 / 2);
  stageMultiplierMap.set(2, 4 / 2);
  stageMultiplierMap.set(3, 5 / 2);
  stageMultiplierMap.set(4, 6 / 2);
  stageMultiplierMap.set(5, 7 / 2);
  stageMultiplierMap.set(6, 8 / 2);
  var accuracyStageMultiplierMap = new Map();
  accuracyStageMultiplierMap.set(-6, 3 / 9);
  accuracyStageMultiplierMap.set(-5, 3 / 8);
  accuracyStageMultiplierMap.set(-4, 3 / 7);
  accuracyStageMultiplierMap.set(-3, 3 / 6);
  accuracyStageMultiplierMap.set(-2, 3 / 5);
  accuracyStageMultiplierMap.set(-1, 3 / 4);
  accuracyStageMultiplierMap.set(0, 3 / 3);
  accuracyStageMultiplierMap.set(1, 4 / 3);
  accuracyStageMultiplierMap.set(2, 5 / 3);
  accuracyStageMultiplierMap.set(3, 6 / 3);
  accuracyStageMultiplierMap.set(4, 7 / 3);
  accuracyStageMultiplierMap.set(5, 8 / 3);
  accuracyStageMultiplierMap.set(6, 9 / 3);
  var stageStatDisplayTexts = {
    attack: "attack",
    defense: "defense",
    specialAttack: "special attack",
    specialDefense: "special defense",
    accuracy: "accuracy",
    evasion: "evasion",
    speed: "speed"
  };

  // src/model/move-description.ts
  function getMoveDescription(move) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
    if (move.description) {
      return move.description;
    }
    const descriptions = [];
    if ((_a = move.effects) == null ? void 0 : _a.applyNonVolatileStatusConditions) {
      move.effects.applyNonVolatileStatusConditions.conditions.forEach((condition) => {
        let statusConditionText = "";
        if (condition.chance < 1) {
          switch (condition.type) {
            case "ASLEEP":
              statusConditionText = `${condition.chance * 100}% chance to put target to sleep`;
              break;
            case "BADLY POISONED":
              statusConditionText = `${condition.chance * 100}% chance to badly poison target`;
              break;
            case "BURNED":
              statusConditionText = `${condition.chance * 100}% chance to burn target`;
              break;
            case "FROZEN":
              statusConditionText = `${condition.chance * 100}% chance to freeze target`;
              break;
            case "PARALYZED":
              statusConditionText = `${condition.chance * 100}% chance to paralyze target`;
              break;
            case "POISONED":
              statusConditionText = `${condition.chance * 100}% chance to poison target`;
              break;
          }
        } else {
          switch (condition.type) {
            case "ASLEEP":
              statusConditionText = `Puts target to sleep`;
              break;
            case "BADLY POISONED":
              statusConditionText = `Badly poisons target`;
              break;
            case "BURNED":
              statusConditionText = `Burns target`;
              break;
            case "FROZEN":
              statusConditionText = `Freezes target`;
              break;
            case "PARALYZED":
              statusConditionText = `Paralyzes target`;
              break;
            case "POISONED":
              statusConditionText = `Poisons target`;
              break;
          }
        }
        descriptions.push(statusConditionText);
      });
    }
    if ((_b = move.effects) == null ? void 0 : _b.applyConfusion) {
      if (move.effects.applyConfusion.chance < 1) {
        descriptions.push(`${move.effects.applyConfusion.chance * 100}% chance to confuse target`);
      } else {
        descriptions.push(`Confuses target`);
      }
    }
    if ((_c = move.effects) == null ? void 0 : _c.modifyStages) {
      move.effects.modifyStages.modifiers.forEach((modifier) => {
        const raiseOrLower = modifier.stages > 0 ? "raise" : "lower";
        const raiseOrLowerPresentTense = modifier.stages > 0 ? "Raises" : "Lowers";
        const statText = stageStatDisplayTexts[modifier.stageStat];
        const userOrTarget = modifier.userOrTarget.toLowerCase();
        const stageOrStages = modifier.stages > 1 ? "stages" : "stage";
        const numberText = Math.abs(modifier.stages);
        if (modifier.chance < 1) {
          descriptions.push(`${modifier.chance * 100}% chance to ${raiseOrLower} ${userOrTarget}'s ${statText} by ${numberText} ${stageOrStages}`);
        } else {
          descriptions.push(`${raiseOrLowerPresentTense} ${userOrTarget}'s ${statText} by ${numberText} ${stageOrStages}`);
        }
      });
    }
    if ((_d = move.effects) == null ? void 0 : _d.halfRemainingHP) {
      descriptions.push(`Always takes off half of the target's remaining HP`);
    }
    if ((_e = move.effects) == null ? void 0 : _e.multipleHits) {
      if (move.effects.multipleHits.additionalHits.length === 1 && move.effects.multipleHits.additionalHits[0].chance === 1) {
        descriptions.push(`Hits twice per turn`);
      } else {
        descriptions.push(`Hits 2-${move.effects.multipleHits.additionalHits.length + 1} times per turn`);
      }
    }
    if ((_f = move.effects) == null ? void 0 : _f.flinchTarget) {
      descriptions.push(`${move.effects.flinchTarget.chance * 100}% chance to cause target to flinch`);
    }
    if ((_g = move.effects) == null ? void 0 : _g.protectUser) {
      descriptions.push(`Prevents damage and effects from the enemy's attack. Its chance of failing rises if used in succession`);
    }
    if ((_h = move.effects) == null ? void 0 : _h.drain) {
      descriptions.push(`User heals for ${move.effects.drain.percent * 100}% of the damage done`);
    }
    if ((_i = move.effects) == null ? void 0 : _i.increaseCritical) {
      descriptions.push(`Increased critical hit ratio`);
    }
    if ((_j = move.effects) == null ? void 0 : _j.constantDamage) {
      descriptions.push(`Always does ${move.effects.constantDamage.damage} damage`);
    }
    if ((_k = move.effects) == null ? void 0 : _k.healUser) {
      descriptions.push(`Restores ${move.effects.healUser.percent * 100}% of the user's max HP`);
    }
    if ((_l = move.effects) == null ? void 0 : _l.doublePowerIfTargetHasStatus) {
      if (move.effects.doublePowerIfTargetHasStatus.statuses === "ANY") {
        descriptions.push(`Power doubles if target has a status condition`);
      } else {
        descriptions.push(`Power doubles if target is ${move.effects.doublePowerIfTargetHasStatus.statuses[0].toLowerCase()}`);
      }
    }
    if ((_m = move.effects) == null ? void 0 : _m.lastResort) {
      descriptions.push(`Fails if user has not used all other moves first`);
    }
    if ((_n = move.effects) == null ? void 0 : _n.applyBind) {
      descriptions.push(`Target can't switch and takes damage each turn`);
    }
    if ((_o = move.effects) == null ? void 0 : _o.copyTargetLastMove) {
      descriptions.push(`Copies opponent's last move`);
    }
    if ((_p = move.effects) == null ? void 0 : _p.randomMove) {
      descriptions.push(`Uses a random move`);
    }
    if ((_q = move.effects) == null ? void 0 : _q.doublePowerIfDamagedFirst) {
      descriptions.push(`Double power if user was hit first`);
    }
    if ((_r = move.effects) == null ? void 0 : _r.doubleDamageTaken) {
      descriptions.push(`Hits back with double damage if hit with a ${move.effects.doubleDamageTaken.categoryRestriction.toLowerCase()} attack first`);
    }
    if ((_s = move.effects) == null ? void 0 : _s.removeUserType) {
      descriptions.push(`After using this, the user will no longer be ${move.effects.removeUserType.type} type`);
    }
    if (((_t = move.effects) == null ? void 0 : _t.ignoreAccuracyAndEvasion) && descriptions.length === 0) {
      descriptions.push(`Ignores accuracy and evasion`);
    }
    const joined = descriptions.join(". ");
    if (joined !== "") {
      return joined + ".";
    } else {
      return joined;
    }
  }

  // src/model/move.ts
  function buildMove(moveDefinition) {
    return Object.assign({
      pp: moveDefinition.startingPP,
      priority: moveDefinition.priority ? moveDefinition.priority : 0,
      description: getMoveDescription(moveDefinition),
      accuracy: moveDefinition.accuracy ? moveDefinition.accuracy : 1
    }, moveDefinition);
  }
  function getAccuracyDisplayValue(move) {
    return Math.floor(move.accuracy * 100);
  }
  function makesContact(move) {
    if (move.category === "PHYSICAL" && move.makesContact !== false) {
      return true;
    } else {
      return false;
    }
  }

  // src/model/pokemon-species.ts
  function getSpriteName(species) {
    return species.spriteName ? species.spriteName : species.name.toLowerCase();
  }

  // src/model/pokemon.ts
  var HP_FACTOR = 500;
  var Pokemon = class {
    constructor(species) {
      this.stages = {
        "attack": 0,
        "defense": 0,
        "specialAttack": 0,
        "specialDefense": 0,
        "accuracy": 0,
        "evasion": 0,
        "speed": 0
      };
      this.movesUsed = {
        0: false,
        1: false,
        2: false,
        3: false
      };
      var _a;
      this.species = species;
      this.name = species.name;
      this.pokedexNumber = species.pokedexNumber;
      const startingHP = Math.floor(species.hp / 100 * HP_FACTOR);
      this.startingHP = ((_a = species.ability) == null ? void 0 : _a.wonderGuard) ? 1 : startingHP;
      this.startingSpriteName = getSpriteName(species);
      this.startingTypes = species.types;
      this.startingSpeed = species.speed;
      this.startingMoves = species.moves.map((moveDef) => buildMove(moveDef));
      this.startingAttack = species.attack;
      this.startingDefense = species.defense;
      this.startingSpecialAttack = species.specialAttack;
      this.startingSpecialDefense = species.specialDefense;
      this.startingSize = species.size;
      this.startingImgHeight = species.imgHeight;
      this.startingAbility = species.ability;
      this.hp = this.startingHP;
      this.spriteName = this.startingSpriteName;
      this.types = this.startingTypes;
      this.speed = this.startingSpeed;
      this.moves = this.startingMoves;
      this.attack = this.startingAttack;
      this.defense = this.startingDefense;
      this.specialAttack = this.startingSpecialAttack;
      this.specialDefense = this.startingSpecialDefense;
      this.size = this.startingSize;
      this.imgHeight = this.startingImgHeight;
      this.ability = this.startingAbility;
      this.level = 50;
      this.confused = false;
      this.flinched = false;
      this.protected = false;
      this.protectedByKingsShield = false;
      this.consecutiveProtectCount = 0;
      this.remainingSleepTurns = 0;
      this.remainingConfusedTurns = 0;
      this.badlyPoisonedTurns = 0;
      this.remainingBindTurns = 0;
      this.bindingMoveName = null;
      this.previousMoveIndex = null;
      this.hasLeechSeed = false;
      this.roosted = false;
      this.preRoostTypes = [];
      this.attackTypeBuff = null;
      this.isSlackingOff = false;
      this.isBladeForm = false;
      this.activeTurnCount = 0;
    }
  };
  function isRaised(pokemon) {
    var _a;
    return pokemon.types.includes("FLYING") || ((_a = pokemon.ability) == null ? void 0 : _a.raised);
  }
  function getCry(p) {
    return `cries/${p.spriteName ? p.spriteName : p.name.toLowerCase()}.mp3`;
  }

  // src/util/async-utils.ts
  function sleep(millis) {
    return __async(this, null, function* () {
      return new Promise((resolve) => setTimeout(resolve, millis));
    });
  }
  function playAnimation(animation, whileCondition, speed) {
    return __async(this, null, function* () {
      return new Promise((resolve) => {
        let frameCount = 0;
        let lastFrameTime = Date.now();
        const callback = () => {
          let currentTime = Date.now();
          if (currentTime - lastFrameTime >= speed) {
            if (whileCondition()) {
              animation();
              frameCount++;
              lastFrameTime = currentTime;
              requestAnimationFrame(callback);
            } else {
              resolve();
            }
          } else {
            requestAnimationFrame(callback);
          }
        };
        requestAnimationFrame(callback);
      });
    });
  }

  // src/util/logger.ts
  var config = {
    enabled: true,
    info: true,
    debug: false,
    ai: true,
    dao: false,
    newEvents: false,
    moveSuccessFormula: false,
    multiHitChances: false,
    typeEffectiveness: false,
    damageFormula: false,
    takeDamage: false
  };
  function configureLogger(values) {
    config = __spreadValues(__spreadValues({}, config), values);
    return config;
  }
  function logInfo(...message) {
    if (config.enabled && config.info) {
      console.log(...message);
    }
  }
  function logDebug(...message) {
    if (config.enabled && config.debug) {
      console.log(...message);
    }
  }
  function logError(message) {
    if (config.enabled) {
      console.log(message);
    }
  }

  // src/client/user-settings-controller.ts
  var USER_SETTINGS_STORAGE_KEY = "userSettings";
  var defaultUserSettings = {
    soundEffects: false,
    music: false
  };
  var userSettings = function() {
    const savedSettingsJson = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
    if (savedSettingsJson) {
      const savedSettings = JSON.parse(savedSettingsJson);
      return savedSettings;
    } else {
      return defaultUserSettings;
    }
  }();
  function saveUserSettings(newUserSettings) {
    userSettings = newUserSettings;
    localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(userSettings));
  }
  function getUserSettings() {
    return userSettings;
  }

  // src/client/client-api.ts
  var API_URL = "/api";
  var cachedUserName = null;
  function getBattle(battleId) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/battle/${battleId}`);
      const data = yield response.json();
      if (data.result === "ERROR") {
        throw new Error(data.details);
      }
      return data;
    });
  }
  function postPlayerAction(battleId, playerActionEvent) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/battle/${battleId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(playerActionEvent)
      });
      const data = yield response.json();
      if (data.result === "ERROR") {
        if (response.status === 401) {
          redirectToLogin();
        }
        throw new Error(data.details);
      }
      return data;
    });
  }
  function getUser() {
    return __async(this, null, function* () {
      var _a, _b;
      const response = yield fetch(`${API_URL}/user`);
      const data = yield response.json();
      if (data.result === "ERROR") {
        if (response.status === 401) {
          redirectToLogin();
        }
        throw new Error(data.details);
      }
      cachedUserName = data.username;
      saveUserSettings({
        music: (_a = data.settings) == null ? void 0 : _a.music,
        soundEffects: (_b = data.settings) == null ? void 0 : _b.soundEffects
      });
      return data;
    });
  }
  function tryToGetExistingUser(username) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/user/${username}`);
      const data = yield response.json();
      if (data.result !== "ERROR") {
        return data;
      }
    });
  }
  function tryToGetUser() {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/user`);
      const data = yield response.json();
      if (data.result !== "ERROR") {
        return data;
      }
    });
  }
  function setUserName(userName) {
    cachedUserName = userName;
  }
  function getUserName() {
    if (!cachedUserName) {
      throw new Error("No cached username. Make sure getUser() is called first.");
    }
    return cachedUserName;
  }
  function getPlayers(battle) {
    const userName = getUserName();
    const userPlayer = battle.players.find((p) => p.name === userName);
    const enemyPlayer = battle.players.find((p) => p.name !== userName);
    if (userPlayer && enemyPlayer) {
      return {
        user: userPlayer,
        enemy: enemyPlayer
      };
    } else {
      clientError(`Unable to find players inside battle`);
      throw new Error();
    }
  }
  function postBattle(createBattleRequest) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/battle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(createBattleRequest)
      });
      const data = yield response.json();
      if (data.result === "ERROR") {
        if (response.status === 401) {
          redirectToLogin();
        }
        throw new Error(data.details);
      }
      return data;
    });
  }
  function postSignupRequest(signupRequest) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(signupRequest)
      });
      const data = yield response.json();
      if (data.result === "ERROR") {
        throw new Error(data.details);
      }
      return data;
    });
  }
  function postLoginRequest(loginRequest) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginRequest)
      });
      if (response.status === 401) {
        clientError("Invalid login credentials");
        throw new Error();
      }
      const data = yield response.json();
      if (data.result === "ERROR") {
        throw new Error(data.details);
      }
      return data;
    });
  }
  function postChallengeRequest() {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = yield response.json();
      if (data.result === "ERROR") {
        if (response.status === 401) {
          redirectToLogin();
        }
        throw new Error(data.details);
      }
      return data;
    });
  }
  function postChallengeAccept(challengeId) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/challenge/${challengeId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = yield response.json();
      if (data.result === "ERROR") {
        if (response.status === 401) {
          redirectToLogin(`/challenge/${challengeId}/accept`);
        }
        throw new Error(data.details);
      }
      return data;
    });
  }
  function getChallenge(challengeId) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/challenge/${challengeId}`);
      const data = yield response.json();
      if (data.result === "ERROR") {
        throw new Error(data.details);
      }
      return data;
    });
  }
  function putUser(username, newUserData) {
    return __async(this, null, function* () {
      const response = yield fetch(`${API_URL}/user/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUserData)
      });
      const data = yield response.json();
      if (data.result === "ERROR") {
        throw new Error(data.details);
      }
      return data;
    });
  }
  function clientError(message) {
    logError(message);
    alert(message);
  }
  function redirectToLogin(postLoginRedirect) {
    const fromParam = postLoginRedirect ? postLoginRedirect : window.location.pathname;
    window.location.href = "/login?from=" + fromParam;
  }

  // src/client/audio.ts
  var miscAudioFiles = [
    "faint.mp3",
    "switch.mp3",
    "click.wav"
  ];
  var moveAudioFiles = [
    "attack_beam.mp3",
    "attack_blast.mp3",
    "attack_bug.mp3",
    "attack_double_punch.mp3",
    "attack_electric_long.mp3",
    "attack_electric.mp3",
    "attack_explosion.mp3",
    "attack_fire_long.mp3",
    "attack_fire.mp3",
    "attack_generic_long.mp3",
    "attack_generic.mp3",
    "attack_ghost.mp3",
    "attack_grass_long.mp3",
    "attack_ground.mp3",
    "attack_ground_long.mp3",
    "attack_guillotine.mp3",
    "attack_howling_wind.mp3",
    "attack_ice_crash.mp3",
    "attack_ice_shards.mp3",
    "attack_ice.mp3",
    "attack_jolt.mp3",
    "attack_pre_explosion.mp3",
    "attack_psychic_special.mp3",
    "attack_rapid_spin.mp3",
    "attack_ripple.mp3",
    "attack_rock.mp3",
    "attack_sand.mp3",
    "attack_scratch.mp3",
    "attack_slap.mp3",
    "attack_slash_special.mp3",
    "attack_slash.mp3",
    "attack_water_long_crash.mp3",
    "attack_water_long.mp3",
    "attack_water.mp3",
    "attack_precipice_blades.mp3",
    "attack_dragon_pulse.mp3",
    "attack_flamethrower.mp3",
    "status_asleep.mp3",
    "status_buff.mp3",
    "status_burned.mp3",
    "status_confused.mp3",
    "status_copycat.mp3",
    "status_debuff.mp3",
    "status_entry_hazard.mp3",
    "status_frozen.mp3",
    "status_heal.mp3",
    "status_leech_seed.mp3",
    "status_metronome.mp3",
    "status_mirror_move.mp3",
    "status_paralyzed.mp3",
    "status_poisoned.mp3",
    "status_protect.mp3",
    "status_reflect.mp3",
    "status_shell_smash.mp3",
    "status_stealth_rock.mp3",
    "status_swords_dance.mp3",
    "status_transform.mp3",
    "status_belly_drum.mp3",
    "status_confuse_ray.mp3",
    "effect_heal.mp3",
    "effect_stance_change_shield.mp3",
    "effect_stance_change_blade.mp3"
  ];
  var audioFiles = [
    ...miscAudioFiles,
    ...moveAudioFiles
  ];
  var AUDIO_FOLDER = "audio";
  var musicAudio = new Audio();
  musicAudio.volume = 0.05;
  musicAudio.loop = true;
  musicAudio.src = `/${AUDIO_FOLDER}/music/battle.mp3`;
  var moveAudio = new Audio();
  moveAudio.volume = 0.2;
  var effectAudio = new Audio();
  effectAudio.volume = 0.2;
  var cryAudio = new Audio();
  cryAudio.volume = 0.05;
  var switchAndFaintAudio = new Audio();
  switchAndFaintAudio.volume = 0.075;
  function playMoveSound(fileName) {
    if (getUserSettings().soundEffects) {
      moveAudio.src = `/${AUDIO_FOLDER}/moves/${fileName}`;
      moveAudio.play();
    }
  }
  function playEffectSound(fileName) {
    if (getUserSettings().soundEffects) {
      effectAudio.src = `/${AUDIO_FOLDER}/moves/${fileName}`;
      effectAudio.play();
    }
  }
  function playStatusSound(status) {
    if (getUserSettings().soundEffects) {
      const statusSounds = {
        "BURNED": "status_burned.mp3",
        "ASLEEP": "status_asleep.mp3",
        "FROZEN": "status_frozen.mp3",
        "PARALYZED": "status_paralyzed.mp3",
        "POISONED": "status_poisoned.mp3",
        "BADLY POISONED": "status_poisoned.mp3"
      };
      effectAudio.src = `/${AUDIO_FOLDER}/moves/${statusSounds[status]}`;
      effectAudio.play();
    }
  }
  function playCry(fileName) {
    if (getUserSettings().soundEffects) {
      cryAudio.src = `/${AUDIO_FOLDER}/${fileName}`;
      cryAudio.play();
    }
  }
  function playMusic(fileName) {
    if (getUserSettings().music) {
      musicAudio.muted = false;
      musicAudio.src = `/${AUDIO_FOLDER}/music/${fileName}`;
      musicAudio.play();
    }
  }
  function stopMusic() {
    if (getUserSettings().music) {
      musicAudio.muted = true;
    }
  }
  function playClickSound() {
  }
  function playFaintSound() {
    if (getUserSettings().soundEffects) {
      switchAndFaintAudio.src = `/${AUDIO_FOLDER}/faint.mp3`;
      switchAndFaintAudio.play();
    }
  }
  function playSwitchSound() {
    if (getUserSettings().soundEffects) {
      switchAndFaintAudio.src = `/${AUDIO_FOLDER}/switch.mp3`;
      switchAndFaintAudio.play();
    }
  }

  // src/client/base-pokemon-component.ts
  var BasePokemonComponent = class extends BaseComponent {
    constructor(props, isUser) {
      super(props);
      this.deploying = false;
      this.withdrawing = false;
      this.spikes = 0;
      this.toxic_spikes = 0;
      this.rocks = false;
      this.web = false;
      this.reflect = false;
      this.light_screen = false;
      this.isUser = isUser;
      this.status = props.pokemon.nonVolatileStatusCondition;
      if (props.animation_ctx.isDeploying || props.pokemon.hp <= 0) {
        this.visible = false;
        this.hudVisible = false;
      } else {
        this.visible = true;
        this.hudVisible = true;
      }
      if (this.props.player) {
        this.spikes = this.props.player.spikeLayerCount;
        this.toxic_spikes = this.props.player.toxicSpikeLayerCount;
        this.rocks = this.props.player.hasStealthRock;
        this.web = this.props.player.hasStickyWeb;
        this.reflect = this.props.player.remainingReflectTurns > 0;
        this.light_screen = this.props.player.remainingLightScreenTurns > 0;
      }
    }
    beforeMount() {
      this.handleTakeDamageAnimation = this.handleTakeDamageAnimation.bind(this);
      this.handleHealAnimation = this.handleHealAnimation.bind(this);
      this.handleDeploy = this.handleDeploy.bind(this);
      this.handleWithdraw = this.handleWithdraw.bind(this);
      this.handleFaint = this.handleFaint.bind(this);
      this.handleStatusChange = this.handleStatusChange.bind(this);
      this.handleHazardsChange = this.handleHazardsChange.bind(this);
      this.$controller.subscribe("TAKE_DAMAGE_ANIMATION", this.handleTakeDamageAnimation);
      this.$controller.subscribe("HEAL_ANIMATION", this.handleHealAnimation);
      this.$controller.subscribe("DEPLOY_ANIMATION", this.handleDeploy);
      this.$controller.subscribe("WITHDRAW", this.handleWithdraw);
      this.$controller.subscribe("FAINT_ANIMATION", this.handleFaint);
      this.$controller.subscribe("STATUS_CHANGE", this.handleStatusChange);
      this.$controller.subscribe("HAZARDS_CHANGE", this.handleHazardsChange);
    }
    beforeUnmount() {
      this.$controller.unsubscribe("TAKE_DAMAGE_ANIMATION", this.handleTakeDamageAnimation);
      this.$controller.subscribe("HEAL_ANIMATION", this.handleHealAnimation);
      this.$controller.unsubscribe("DEPLOY_ANIMATION", this.handleDeploy);
      this.$controller.unsubscribe("WITHDRAW", this.handleWithdraw);
      this.$controller.unsubscribe("FAINT_ANIMATION", this.handleFaint);
      this.$controller.unsubscribe("STATUS_CHANGE", this.handleStatusChange);
      this.$controller.unsubscribe("HAZARDS_CHANGE", this.handleHazardsChange);
    }
    handleHealAnimation(event) {
      return __async(this, null, function* () {
        if (this.isForThisPokemon(event.playerName)) {
          playEffectSound("effect_heal.mp3");
          const sprite = this.$element.querySelector("[data-pokemon-img]");
          const speed = 70;
          const totalToggles = 6;
          let toggleCount = 0;
          let flashing = false;
          const toggleFlashing = () => {
            flashing = !flashing;
            if (flashing) {
              sprite.style.opacity = "0.2";
            } else {
              sprite.style.opacity = "1";
            }
            toggleCount++;
          };
          const whileCondition = () => toggleCount < totalToggles;
          yield playAnimation(toggleFlashing, whileCondition, speed);
        }
      });
    }
    handleTakeDamageAnimation(event) {
      return __async(this, null, function* () {
        if (this.isForThisPokemon(event.playerName)) {
          if (event.directAttack) {
            yield this.doDirectAttackDamageAnimation(event);
          } else {
            yield this.doIndirectDamageAnimation(event);
          }
        }
      });
    }
    doDirectAttackDamageAnimation(event) {
      return __async(this, null, function* () {
        const sprite = this.$element.querySelector("[data-pokemon-img]");
        const isUser = event.playerName === getUserName();
        const startPaddingLeft = parseInt(sprite.style.paddingLeft.replace("px", ""));
        const userAdjustPosition = (offset) => sprite.style.paddingLeft = startPaddingLeft - offset + "px";
        const enemyAdjustPostiion = (offset) => sprite.style.marginLeft = offset + "px";
        const adjustPosition = isUser ? userAdjustPosition : enemyAdjustPostiion;
        sprite.style.opacity = "0.5";
        yield sleep(80);
        adjustPosition(15);
        yield sleep(100);
        sprite.style.opacity = "1";
        adjustPosition(10);
        yield sleep(20);
        adjustPosition(5);
        yield sleep(20);
        adjustPosition(0);
      });
    }
    doIndirectDamageAnimation(event) {
      return __async(this, null, function* () {
        if (getUserSettings().soundEffects && event.playSound) {
          playMoveSound("attack_generic.mp3");
          yield sleep(200);
        }
        const sprite = this.$element.querySelector("[data-pokemon-img]");
        sprite.style.opacity = "0.2";
        yield sleep(100);
        sprite.style.opacity = "1";
      });
    }
    isForThisPokemon(playerName) {
      return this.isUser && playerName === getUserName() || !this.isUser && playerName !== getUserName();
    }
    handleDeploy(event) {
      return __async(this, null, function* () {
        if (this.isForThisPokemon(event.playerName)) {
          yield this.$controller.publish({
            type: "HEALTH_BAR_ANIMATION",
            newHP: this.props.pokemon.hp,
            oldHP: this.props.pokemon.hp,
            playerName: event.playerName,
            totalHP: this.props.pokemon.startingHP
          });
          this.withdrawing = false;
          this.deploying = true;
          this.visible = true;
          this.status = this.props.pokemon.nonVolatileStatusCondition;
          yield sleep(270);
          this.hudVisible = true;
          this.deploying = false;
          yield sleep(450);
        }
      });
    }
    handleWithdraw(event) {
      return __async(this, null, function* () {
        if (this.isForThisPokemon(event.playerName)) {
          playSwitchSound();
          this.withdrawing = true;
          this.props.pokemon.imgHeight = this.props.pokemon.startingImgHeight;
          this.props.pokemon.spriteName = this.props.pokemon.startingSpriteName;
          yield sleep(200);
          this.hudVisible = false;
          this.status = null;
        }
      });
    }
    handleFaint(event) {
      return __async(this, null, function* () {
        if (this.isForThisPokemon(event.playerName)) {
          this.withdrawing = true;
          yield sleep(200);
          this.hudVisible = false;
        }
      });
    }
    handleStatusChange(event) {
      return __async(this, null, function* () {
        if (this.isForThisPokemon(event.playerName)) {
          if (event.newStatus) {
            playStatusSound(event.newStatus);
          }
          this.status = event.newStatus;
          yield sleep(600);
        }
      });
    }
    handleHazardsChange(event) {
      return __async(this, null, function* () {
        if (this.isForThisPokemon(event.playerName)) {
          this.spikes = event.spikeLayerCount;
          this.toxic_spikes = event.toxicSpikeLayerCount;
          this.web = event.hasStickyWeb;
          this.rocks = event.hasStealthRock;
          this.reflect = event.hasReflect;
          this.light_screen = event.hasLightScreen;
        }
      });
    }
  };

  // src/client/hazards-component.ts
  var EnemyHazardsComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
        <div class="absolute">

            <div class="relative top-10">
                <div $class="{invisible: !props.light_screen}" class="h-20 w-20 z-35 relative" 
                    style="background-color: #90a2de; opacity: 0.5; top: 85px; left: 14px">
                </div>
                <div $class="{invisible: !props.reflect}" class="h-20 w-20 z-35 absolute" 
                    style="background-color: #cf8686; opacity: 0.5; top: 70; left: 10px">
                </div>
            </div>
            
            <div $class="{invisible: !props.rocks}" class="flex flex-row justify-end mr-12 relative top-7">
                <img class="z-20 h-2 mr-7" src="/img/rock1.png">
                <img class="h-4 mr-4" src="/img/rock2.png">
                <img class="h-2 mr-1 " src="/img/rock1.png">
                <img class="h-4 mr-3 " src="/img/rock1.png">
                <img class="z-20 h-2 " src="/img/rock2.png">
            </div>

            <div class="flex flex-row justify-end relative top-14">
                <div class="w-32 z-10">
                    <div class="flex flex-row justify-items-start">
                    <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 relative ml-6 top-1 darker-2" src="/img/toxic-spike.png">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end relative top-14">
                <div class="w-32 z-10">
                    <div class="flex flex-row justify-items-start">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 darker-2" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative bottom-1" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 3}" class="h-4 relative darker-1" src="/img/spike.png">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end relative top-14">
                <div class="w-32 z-10">
                    <div class="flex flex-row justify-items-start">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative bottom-2" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 darker-2" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative bottom-2" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 3}" class="h-4 relative bottom-2 darker-1" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative bottom-1" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                    </div>
                </div>
            </div>

            <div $class="{invisible: !props.web}" class="flex flex-row justify-end mr-12 relative top-3">
                <img class="h-12 w-28 mr-1" src="/img/web.png">
            </div>
        
        </div>
    `;
    }
  };
  var UserHazardsComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
        <div class="absolute">

            <div class="relative top-10">
                <div $class="{invisible: !props.light_screen}" class="h-24 w-24 relative" 
                    style="z-index: -10; background-color: #90a2de; opacity: 0.5; top: 35px; left: 55px">
                </div>
                <div $class="{invisible: !props.reflect}" class="h-24 w-24 absolute" 
                    style="z-index: -11; background-color: #cf8686; opacity: 0.5; top: 25px; left: 59px">
                </div>
            </div>
            
            <div $class="{invisible: !props.rocks}" class="flex flex-row justify-end mr-12 relative left-7">
                <img class="z-20 h-3 mr-7" src="/img/rock1.png">
                <img class="h-5 mr-4" src="/img/rock2.png">
                <img class="h-3 mr-1 " src="/img/rock1.png">
                <img class="h-5 mr-3 " src="/img/rock1.png">
                <img class="z-20 h-3 " src="/img/rock2.png">
            </div>

            <div class="flex flex-row justify-end relative top-10">
                <div class="w-32 z--10">
                    <div class="flex flex-row justify-items-start">
                    <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 relative ml-6 top-1 darker-2" src="/img/toxic-spike.png">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end relative top-10">
                <div class="w-32 z--10">
                    <div class="flex flex-row justify-items-start">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 darker-2" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative bottom-1" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 3}" class="h-4 relative darker-1" src="/img/spike.png">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-end relative top-10">
                <div class="w-32 z--10">
                    <div class="flex flex-row justify-items-start">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative bottom-2" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.toxic_spikes < 2}" class="h-4 darker-2" src="/img/toxic-spike.png">
                        <img $class="{invisible: props.spikes < 1}" class="h-4 relative bottom-2" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 3}" class="h-4 relative bottom-2 darker-1" src="/img/spike.png">
                        <img $class="{invisible: props.spikes < 2}" class="h-4 relative bottom-1" src="/img/spike.png">
                        <img $class="{invisible: props.toxic_spikes < 1}" class="h-4" src="/img/toxic-spike.png">
                    </div>
                </div>
            </div>

            <div $class="{invisible: !props.web}" class="flex flex-row justify-end mr-12 relative bottom-2 left-8">
                <img class="h-12 w-28 mr-1" src="/img/web.png">
            </div>

        </div>
    `;
    }
  };

  // src/client/hp-component.ts
  var HpComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.template = `
    <div>
      <hp-bar-component :percent="percent" :color="color"></hp-bar-component>
    </div>
  `;
      this.includes = {
        HpBarComponent
      };
      this.percent = getPercent(props.pokemon.hp, props.pokemon.startingHP);
      this.color = getColor(this.percent);
    }
    beforeMount() {
      this.$controller.subscribe("HEALTH_BAR_ANIMATION", this.changeHealth);
    }
    beforeUnmount() {
      this.$controller.unsubscribe("HEALTH_BAR_ANIMATION", this.changeHealth);
    }
    changeHealth(event) {
      return __async(this, null, function* () {
        if (this.props.is_user && event.playerName === getUserName() || !this.props.is_user && event.playerName !== getUserName()) {
          if (event.newHP === event.oldHP) {
            this.percent = getPercent(event.newHP, event.totalHP);
            this.color = getColor(this.percent);
          } else {
            this.percent = getPercent(event.oldHP, event.totalHP);
            const targetPercent = getPercent(event.newHP, event.totalHP);
            this.color = getColor(targetPercent);
            const animation = () => {
              const plusOrMinus = this.percent < targetPercent ? 1 : -1;
              this.percent += plusOrMinus;
            };
            const whileCondition = () => this.percent > 0 && this.percent <= 100 && this.percent !== targetPercent;
            const speed = 12;
            yield playAnimation(animation, whileCondition, speed);
          }
        }
      });
    }
  };
  var HpBarComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="flex flex-row justify-end items-center h-4">
      <div class="rounded w-full h-2 border mx-2 mb-3 ">
        <div class="h-2.5 pt-0.5 pb-0.5 px-1 rounded-lg bg-gray-600">
          <div style="width: {{props.percent}}%;" class="h-1 rounded-lg {{props.color}}"></div>
        </div>
      </div>
    </div>
  `;
    }
  };
  function getPercent(current, total) {
    const totalOrZero = total > 0 ? total : 0;
    const result = current / totalOrZero * 100;
    return result >= 0 ? Math.ceil(result) : 0;
  }
  function getColor(percent) {
    if (percent > 50) {
      return "bg-green-200";
    } else if (percent > 20) {
      return "bg-yellow-300";
    } else {
      return "bg-red-500";
    }
  }

  // src/client/status-indicator-component.ts
  var StatusIndicatorComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.displayValues = {
        "BURNED": { text: "BRN", bgColor: "#EE8130" },
        "ASLEEP": { text: "SLP", bgColor: "#bfbfbf" },
        "PARALYZED": { text: "PAR", bgColor: "#F7D02C" },
        "FROZEN": { text: "FRZ", bgColor: "#96D9D6" },
        "POISONED": { text: "PSN", bgColor: "#A33EA1" },
        "BADLY POISONED": { text: "PSN", bgColor: "#330066" }
      };
      this.template = `
    <span style="background-color: {{displayValues[props.condition].bgColor}}" class="text-white rounded-lg py-1 px-2 border-black border-solid uppercase text-sm">
      {{displayValues[props.condition].text}}
    </span>
  `;
    }
  };

  // src/client/enemy-pokemon-component.ts
  var pressAndHoldCallback;
  var EnemyPokemonComponent = class extends BasePokemonComponent {
    constructor(props) {
      super(props, false);
      this.template = `
    <div>
      <div $class="{invisible: !hudVisible}" class="absolute flex flex-row justify-start items-center h-32 w-full">
        <div style="width: 10.2rem" class="z-20 border-2 border-solid border-black h-14 ml-5 bg-gray-100">
          <div class="flex flex-row justify-between h-10">
            <div class="ml-2 mt-2 select-none">{{props.pokemon.name}}</div>
            <div $if="!status" class="mr-2 mt-2 select-none">Lv{{props.pokemon.level}}</div>
            <div $if="status" class="mr-2 mt-2">
              <status-indicator-component :condition="status"></status-indicator-component>
            </div>
          </div>
          <hp-component :pokemon="props.pokemon" :is_user="false"></hp-component>
        </div>
      </div>
      <div class="flex flex-row justify-end items-end h-32">
        <enemy-hazards-component 
          :reflect="reflect" 
          :light_screen="light_screen" 
          :rocks="rocks" 
          :web="web" 
          :spikes="spikes" 
          :toxic_spikes="toxic_spikes">
        </enemy-hazards-component>
        <img 
          @mousedown="(e)=>handleDown(e)" 
          @mouseup="(e)=>handleUp(e)" 
          @touchstart="(e)=>handleDown(e)" 
          @touchend="(e)=>handleUp(e)"
          $class="{invisible: !visible, enemy_deploying: deploying, enemy_withdrawing: withdrawing}" 
          class="{{props.animation_ctx.transformAnimationState}} max-h-32 pr-14 absolute block cursor-pointer z-10" 
          :src="getPokemonImg()"
          data-pokemon-img>
      </div>
    </div>
  `;
      this.includes = {
        EnemyHazardsComponent,
        HpComponent,
        StatusIndicatorComponent
      };
    }
    getPokemonImg() {
      return `/sprites/front-ani/${this.props.pokemon.spriteName}.gif`;
    }
    handleDown(event) {
      event.preventDefault();
      pressAndHoldCallback = setTimeout(() => {
        const pokemonToShow = this.props.pokemon.species;
        if (pokemonToShow) {
          this.showPokemonCard();
        }
        pressAndHoldCallback = null;
      }, 500);
    }
    handleUp(event) {
      event.preventDefault();
      if (pressAndHoldCallback) {
        clearTimeout(pressAndHoldCallback);
        this.showPokemonCard();
      }
    }
    showPokemonCard() {
      this.$controller.publish({
        type: "SHOW_POKEMON_CARD",
        pokemon: this.props.pokemon,
        isUser: false
      });
    }
  };

  // src/client/user-pokemon-component.ts
  var pressAndHoldCallback2;
  var UserPokemonComponent = class extends BasePokemonComponent {
    constructor(props) {
      super(props, true);
      this.template = `
    <div class="relative">
      <div $class="{invisible: !hudVisible}" class="absolute flex flex-row justify-end items-center h-32 w-full">
        <div style="width: 10.2rem" class="z-20 rounded border-2 border-solid border-black h-14 mr-5 bg-gray-100">
          <div class="flex flex-row justify-between h-10">
            <div class="ml-2 mt-2 select-none">{{props.pokemon.name}}</div>
            <div $if="!status" class="mr-2 mt-2 select-none">Lv{{props.pokemon.level}}</div>
            <div $if="status" class="mr-2 mt-2">
              <status-indicator-component :condition="status"></status-indicator-component>
            </div>
          </div>
          <hp-component :pokemon="props.pokemon" :is_user="true"></hp-component>
        </div>
      </div>
      <div class="flex flex-row justify-start items-end h-32">
        <img 
          @mousedown="(e)=>handleDown(e)" 
          @mouseup="(e)=>handleUp(e)" 
          @touchstart="(e)=>handleDown(e)" 
          @touchend="(e)=>handleUp(e)"
          $class="{invisible: !visible, user_deploying: deploying, user_withdrawing: withdrawing}" 
          class="{{props.animation_ctx.transformAnimationState}} {{getBottomPadding()}} absolute block cursor-pointer z-10" 
          style="height: {{getImgHeight()}}rem; padding-left: {{getLeftPadding()}}px"
          :src="getPokemonImg()"
          data-pokemon-img>
        <user-hazards-component 
          :reflect="reflect" 
          :light_screen="light_screen" 
          :rocks="rocks" 
          :web="web" 
          :spikes="spikes" 
          :toxic_spikes="toxic_spikes">
        </user-hazards-component>
      </div>
    </div>
  `;
      this.includes = {
        HpComponent,
        StatusIndicatorComponent,
        UserHazardsComponent
      };
    }
    getLeftPadding() {
      return 24;
    }
    getBottomPadding() {
      if (this.props.pokemon.name.toLowerCase() === "sylveon") {
        return "";
      } else {
        return "pb-3";
      }
    }
    getImgHeight() {
      return this.props.pokemon.imgHeight;
    }
    getPokemonImg() {
      return `/sprites/back-ani/${this.props.pokemon.spriteName}.gif`;
    }
    handleDown(event) {
      event.preventDefault();
      pressAndHoldCallback2 = setTimeout(() => {
        const pokemonToShow = this.props.pokemon.species;
        if (pokemonToShow) {
          this.showPokemonCard();
        }
        pressAndHoldCallback2 = null;
      }, 500);
    }
    handleUp(event) {
      event.preventDefault();
      if (pressAndHoldCallback2) {
        clearTimeout(pressAndHoldCallback2);
        this.showPokemonCard();
      }
    }
    showPokemonCard() {
      this.$controller.publish({
        type: "SHOW_POKEMON_CARD",
        pokemon: this.props.pokemon,
        isUser: true
      });
    }
  };

  // src/client/battle-zone-component.ts
  var BattleZoneComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="w-full">
      <enemy-pokemon-component :pokemon="props.enemy" :player="props.enemy_player" :animation_ctx="props.enemy_animation_ctx"></enemy-pokemon-component>
      <user-pokemon-component :pokemon="props.user" :player="props.user_player" :animation_ctx="props.user_animation_ctx"></user-pokemon-component>
    </div>
  `;
      this.includes = {
        EnemyPokemonComponent,
        UserPokemonComponent
      };
    }
  };

  // src/util/text-utils.ts
  function getTextLines(fullText, maxLineLength) {
    const lines = [];
    let currentLine = "";
    if (fullText && fullText.length) {
      const words = fullText.split(" ").map((w) => w.trim());
      words.forEach((word) => {
        if (currentLine.length + word.length <= maxLineLength) {
          currentLine += word + " ";
        } else {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        }
      });
      if (currentLine) {
        lines.push(currentLine.trim());
      }
    }
    return lines;
  }

  // src/client/terminal-component.ts
  var MAX_LINES = 2;
  var MAX_LINE_LENGTH = 30;
  var TEXT_SCROLL_SPEED = 15;
  var MESSAGE_DELAY = 1e3;
  var SHORTER_MESSAGE_DELAY = 500;
  var currentEvent = void 0;
  var TerminalComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.messageLines = [];
      this.template = `
    <div style="max-width: 500px;" class="rounded pt-3 pl-4 pr-4 ml-1 mr-1 h-20 border-2 border-solid border-black bg-gray-100 select-none">
      <div $if="messageLines.length > 0">{{messageLines[0]}}</div>
      <div $if="messageLines.length > 1">{{messageLines[1]}}</div>
    </div>
  `;
    }
    beforeMount() {
      return __async(this, null, function* () {
        this.$controller.subscribe("DISPLAY_MESSAGE", this.displayMessage);
      });
    }
    beforeUnmount() {
      this.$controller.unsubscribe("DISPLAY_MESSAGE", this.displayMessage);
    }
    displayMessage(event) {
      return __async(this, null, function* () {
        currentEvent = event;
        if (!event.forPlayerName || event.forPlayerName === getUserName()) {
          this.messageLines = [];
          if (event.message) {
            let message = event.message;
            if (event.referencedPlayerName && event.referencedPlayerName !== getUserName()) {
              message = "The enemy " + message;
            }
            const parsedTextLines = getTextLines(message, MAX_LINE_LENGTH);
            let displayLineCount = 0;
            for (let line of parsedTextLines) {
              if (displayLineCount >= MAX_LINES) {
                this.messageLines.shift();
              }
              this.messageLines.push("");
              let charCount = 0;
              const animation = () => {
                const char = line.charAt(charCount);
                this.messageLines[this.messageLines.length - 1] = this.messageLines[this.messageLines.length - 1] + char;
                charCount++;
              };
              const whileCondition = () => currentEvent === event && charCount < line.length;
              yield playAnimation(animation, whileCondition, TEXT_SCROLL_SPEED);
              displayLineCount++;
              yield sleep(TEXT_SCROLL_SPEED);
            }
            if (event.lengthOfPause === "NONE") {
            } else if (event.lengthOfPause === "SHORTER") {
              yield sleep(SHORTER_MESSAGE_DELAY);
            } else {
              yield sleep(MESSAGE_DELAY);
            }
          }
        }
      });
    }
  };

  // src/client/game-over-buttons-component.ts
  var GameOverButtonsComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="grid grid-cols-2 gap-1">
      <div @click="selectRematch" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
        {{getRematchText()}}
      </div>
      <div @click="selectQuit" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
        Quit
      </div>
    </div>
  `;
    }
    getRematchText() {
      if (this.props.battle.battleType === "SINGLE_PLAYER") {
        if (this.props.battle.battleSubType === "LEAGUE") {
          if (!this.props.won) {
            return "Rematch";
          } else {
            return "Next Battle";
          }
        } else {
          return "New Battle";
        }
      } else {
        return "Rematch";
      }
    }
    selectRematch() {
      if (this.props.battle.battleSubType === "LEAGUE") {
        this.$router.goTo("/league");
      } else {
        this.$controller.publish({
          type: "PLAYER_ACTION",
          playerName: getUserName(),
          details: {
            type: "REQUEST_REMATCH"
          }
        });
      }
    }
    selectQuit() {
      this.$router.goTo("/");
    }
  };

  // src/client/type-colors.ts
  var TYPE_COLORS = {
    NORMAL: "#A8A77A",
    FIRE: "#EE8130",
    WATER: "#6390F0",
    ELECTRIC: "#F7D02C",
    GRASS: "#7AC74C",
    ICE: "#96D9D6",
    FIGHTING: "#C22E28",
    POISON: "#A33EA1",
    GROUND: "#E2BF65",
    FLYING: "#A98FF3",
    PSYCHIC: "#F95587",
    BUG: "#A6B91A",
    ROCK: "#B6A136",
    GHOST: "#735797",
    DRAGON: "#6F35FC",
    DARK: "#705746",
    STEEL: "#B7B7CE",
    FAIRY: "#D685AD"
  };

  // src/client/type-card-component.ts
  var TypeCardComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div 
    style="background-color: {{getBgColor(props.type)}};" 
    class="text-xs rounded text-white text-center p-1 w-20 border border-solid border-gray-500"
    >
      {{props.type}}
    </div>
  `;
    }
    getBgColor(type) {
      return TYPE_COLORS[type];
    }
  };

  // src/client/wide-button-component.ts
  var WideButtonComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div @click="props.action" class="cursor-pointer flex items-center justify-center h-16 col-span-2 rounded border-2 border-solid border-black mx-1 bg-gray-100">
      <div class="mt-1 text-xl">{{props.text}}</div>
    </div>
  `;
    }
  };

  // src/client/move-buttons-component.ts
  var pressAndHoldCallback3;
  var MoveButtonsComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="grid grid-cols-2 gap-1">
      <move-button-component
        $for="move, i in props.moves" 
        :move="move" 
        :index="i">
      </move-button-component>
      <wide-button-component $if="noMovesAreSelectable()" text="Struggle" :action="()=>selectStruggle()"></wide-button-component>
      <wide-button-component text="Cancel" :action="()=>cancel()"></wide-button-component>
    </div>
  `;
      this.includes = {
        MoveButtonComponent,
        WideButtonComponent
      };
    }
    noMovesAreSelectable() {
      return this.props.moves.filter((move) => move.pp > 0).length < 1;
    }
    cancel() {
      return __async(this, null, function* () {
        playClickSound();
        yield this.$controller.publish({
          type: "CLIENT_STATE_CHANGE",
          newState: "SELECTING_ACTION"
        });
      });
    }
    selectStruggle() {
      playClickSound();
      this.$controller.publish({
        type: "PLAYER_ACTION",
        playerName: getUserName(),
        details: {
          type: "SELECT_MOVE",
          moveIndex: 0,
          struggle: true
        }
      });
    }
  };
  var MoveButtonComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div 
      @mousedown="(e)=>handleDown(e)" 
      @mouseup="(e)=>handleUp(e)" 
      @touchstart="(e)=>handleDown(e)" 
      @touchend="(e)=>handleUp(e)"
      class="{{getCursor()}} {{getBgColor(props.move.type)}} {{getMargin()}} p-2 h-20 rounded border-2 border-solid border-black flex flex-col justify-between"
      >
      <div class="flex flex-row justify-between px-2">
        <div class="select-none">{{props.move.name}}</div>
      </div>
      <div class="flex flex-row items-center px-2">
        <type-card-component :type="props.move.type"></type-card-component>
        <div class="select-none ml-7">{{props.move.pp}}/{{props.move.startingPP}}</div>
      </div>
    </div>
  `;
      this.includes = {
        TypeCardComponent
      };
    }
    isSelectable() {
      return this.props.move.pp > 0;
    }
    handleDown(event) {
      event.preventDefault();
      pressAndHoldCallback3 = setTimeout(() => {
        const moveToShow = this.props.move;
        if (moveToShow) {
          playClickSound();
          this.$controller.publish({
            type: "SHOW_MOVE_CARD",
            move: moveToShow
          });
        }
        pressAndHoldCallback3 = null;
      }, 500);
    }
    handleUp(event) {
      event.preventDefault();
      if (pressAndHoldCallback3) {
        clearTimeout(pressAndHoldCallback3);
        this.selectMove();
      }
    }
    selectMove() {
      if (this.isSelectable()) {
        playClickSound();
        this.$controller.publish({
          type: "PLAYER_ACTION",
          playerName: getUserName(),
          details: {
            type: "SELECT_MOVE",
            moveIndex: this.props.index
          }
        });
      }
    }
    getBgColor() {
      return this.isSelectable() ? "bg-gray-100" : "bg-gray-400";
    }
    getMargin() {
      let margin = "";
      if (this.props.index % 2 === 0) {
        margin += "ml-1 ";
      } else {
        margin += "mr-1 ";
      }
      if (this.props.index < 2) {
        margin += "mt-2 ";
      }
      return margin;
    }
    getCursor() {
      return this.isSelectable() ? "cursor-pointer" : "cursor-not-allowed";
    }
    getAccuracy(move) {
      return getAccuracyDisplayValue(move);
    }
  };

  // src/client/pokemon-buttons-component.ts
  var pressAndHoldCallback4;
  var PokemonButtonsComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="grid grid-cols-2 gap-1">
      <pokemon-button-component 
        $for="pokemon, i in props.team" 
        :pokemon="pokemon" 
        :index="i"
        :disabled="props.cancellable && (i === props.current || pokemon.hp <= 0)">
      </pokemon-button-component>
      <wide-button-component $if="props.cancellable" text="Cancel" :action="()=>cancel()">
      </wide-button-component>
    </div>
  `;
      this.includes = {
        PokemonButtonComponent,
        WideButtonComponent
      };
    }
    cancel() {
      return __async(this, null, function* () {
        playClickSound();
        yield this.$controller.publish({
          type: "CLIENT_STATE_CHANGE",
          newState: "SELECTING_ACTION"
        });
      });
    }
  };
  var PokemonButtonComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="{{getCursor()}} {{getBgColor()}} {{getMargin()}} text-center text-lg h-16 rounded border-2 border-solid border-black"
      @mousedown="(e)=>handleDown(e)" 
      @mouseup="(e)=>handleUp(e)" 
      @touchstart="(e)=>handleDown(e)" 
      @touchend="(e)=>handleUp(e)"
      >
      <div class="flex flex-row px-2">
        <div>
          <img class="h-12 w-12" src="/sprites/front/{{props.pokemon.startingSpriteName}}.png" alt:="props.pokemon.name" />
        </div>
        <div>
          <div class="text-xs flex flex-row justify-between items-center w-32 mb-3">
            <div class="ml-3 mt-2">
              {{props.pokemon.name}}
            </div>
            <div $if="props.pokemon.hp <= 0 || !props.pokemon.nonVolatileStatusCondition" class="mr-2 mt-2">
              Lv{{props.pokemon.level}}
            </div>
            <div $if="props.pokemon.hp > 0 && props.pokemon.nonVolatileStatusCondition" class="mr-2 mt-2">
              <status-indicator-component :condition="props.pokemon.nonVolatileStatusCondition"></status-indicator-component>
            </div>
          </div>
          <hp-bar-component :percent="getHpBarProps().percent" :color="getHpBarProps().color"></hp-bar-component>
        </div>
      </div>
    </div>
  `;
      this.includes = {
        HpBarComponent,
        StatusIndicatorComponent
      };
    }
    isSelectable() {
      return this.props.pokemon.hp > 0 && !this.props.disabled;
    }
    handleDown(event) {
      event.preventDefault();
      pressAndHoldCallback4 = setTimeout(() => {
        const pokemonToShow = this.props.pokemon;
        if (pokemonToShow) {
          playClickSound();
          this.$controller.publish({
            type: "SHOW_POKEMON_CARD",
            pokemon: pokemonToShow,
            isUser: true
          });
        }
        pressAndHoldCallback4 = null;
      }, 500);
    }
    handleUp(event) {
      event.preventDefault();
      if (pressAndHoldCallback4) {
        clearTimeout(pressAndHoldCallback4);
        this.selectPokemon();
      }
    }
    selectPokemon() {
      if (this.isSelectable()) {
        playClickSound();
        this.$controller.publish({
          type: "PLAYER_ACTION",
          playerName: getUserName(),
          details: {
            type: "SELECT_POKEMON",
            pokemonIndex: this.props.index
          }
        });
      }
    }
    getBgColor() {
      return this.isSelectable() ? "bg-gray-100" : "bg-gray-400";
    }
    getMargin() {
      let margin = "";
      if (this.props.index % 2 === 0) {
        margin += "ml-1 ";
      } else {
        margin += "mr-1 ";
      }
      if (this.props.index < 2) {
        margin += "mt-2 ";
      }
      return margin;
    }
    getCursor() {
      return this.isSelectable() ? "cursor-pointer" : "cursor-not-allowed";
    }
    getHpBarProps() {
      const percent = getPercent(this.props.pokemon.hp, this.props.pokemon.startingHP);
      const color = getColor(percent);
      return { percent, color };
    }
  };

  // src/model/trap.ts
  function isTrapped(pokemon, enemyPokemon) {
    var _a, _b;
    const stoppedByArenaTrap = ((_a = enemyPokemon.ability) == null ? void 0 : _a.preventNonRaisedEnemySwitching) && !isRaised(pokemon);
    const stoppedByShadowTag = ((_b = enemyPokemon.ability) == null ? void 0 : _b.preventNonGhostEnemySwitching) && !pokemon.types.includes("GHOST");
    return pokemon.bindingMoveName != null || stoppedByArenaTrap || stoppedByShadowTag;
  }

  // src/client/action-buttons-component.ts
  var tipShown = false;
  var ActionButtonsComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="grid grid-cols-2 gap-1">
      <div @click="selectFight" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
        Fight
      </div>
      <div @click="selectSwitch" class="mr-1 mt-2 h-16 {{getCursor()}} {{getBgColor()}} text-center text-lg pt-3 rounded border-2 border-solid border-black">
        Switch Out
      </div>
    </div>
  `;
    }
    selectFight() {
      playClickSound();
      if (!tipShown) {
        tipShown = true;
        this.$controller.publish({
          type: "DISPLAY_MESSAGE",
          message: "Press and hold on a Pokemon or move for more info."
        });
      }
      this.$controller.publish({
        type: "CLIENT_STATE_CHANGE",
        newState: "SELECTING_MOVE"
      });
    }
    selectSwitch() {
      if (!tipShown) {
        tipShown = true;
        this.$controller.publish({
          type: "DISPLAY_MESSAGE",
          message: "Press and hold on a Pokemon or move for more info."
        });
      }
      if (this.canSwitch()) {
        playClickSound();
        this.$controller.publish({
          type: "CLIENT_STATE_CHANGE",
          newState: "SELECTING_POKEMON"
        });
      }
    }
    canSwitch() {
      return !isTrapped(this.props.user_pokemon, this.props.enemy_pokemon);
    }
    getCursor() {
      return this.canSwitch() ? "cursor-pointer" : "cursor-not-allowed";
    }
    getBgColor() {
      return this.canSwitch() ? "bg-gray-100" : "bg-gray-400";
    }
  };

  // src/client/transform-animation.ts
  function getTransformAnimationSequence() {
    return [
      "transform-dark1",
      "transform-dark2",
      "transform-flash",
      "transform-dark2",
      "transform-flash",
      "transform-dark2",
      "transform-flash"
    ];
  }

  // src/client/animation-context.ts
  function defaultAnimationContext() {
    return {
      isDeploying: false,
      transformAnimationState: "normal"
    };
  }

  // src/data/move-data.ts
  var moves = {
    "Hail": {
      name: "Hail",
      startingPP: 10,
      type: "ICE",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        applyWeather: "HAIL"
      },
      description: `Changes weather to hail for 5 turns (damages non-ICE types at the end of each turn).`
    },
    "Rain Dance": {
      name: "Rain Dance",
      startingPP: 5,
      type: "WATER",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        applyWeather: "RAIN"
      },
      description: `Changes weather to rain for 5 turns (increases the damage of WATER moves by 50% and decreases the damage of FIRE moves by 50%).`
    },
    "Sandstorm": {
      name: "Sandstorm",
      startingPP: 10,
      type: "ROCK",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        applyWeather: "SANDSTORM"
      },
      description: `Changes weather to sandstorm for 5 turns (damages Pokemon that are not GROUND, ROCK or STEEL type at the end of each turn).`
    },
    "Sunny Day": {
      name: "Sunny Day",
      startingPP: 10,
      type: "FIRE",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        applyWeather: "HARSH_SUNLIGHT"
      },
      description: `Changes weather to harsh sunlight for 5 turns (increases the damage of FIRE moves by 50% and decreases the damage of WATER moves by 50%).`
    },
    "Dark Void": {
      name: "Dark Void",
      type: "DARK",
      category: "STATUS",
      startingPP: 10,
      accuracy: 0.8,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [
            { type: "ASLEEP", chance: 1 }
          ]
        }
      }
    },
    "Electroweb": {
      name: "Electroweb",
      power: 55,
      startingPP: 15,
      accuracy: 0.95,
      type: "ELECTRIC",
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [
          { chance: 1, stageStat: "speed", stages: -1, userOrTarget: "TARGET" }
        ] }
      }
    },
    "Storm Throw": {
      name: "Storm Throw",
      power: 60,
      startingPP: 10,
      type: "FIGHTING",
      category: "PHYSICAL",
      effects: {
        increaseCritical: { percent: 1 }
      },
      description: `Always results in a critical hit.`
    },
    "Frost Breath": {
      name: "Frost Breath",
      power: 60,
      accuracy: 0.9,
      startingPP: 10,
      type: "ICE",
      category: "SPECIAL",
      effects: {
        increaseCritical: { percent: 1 }
      },
      description: `Always results in a critical hit.`
    },
    "Zippy Zap": {
      name: "Zippy Zap",
      power: 50,
      startingPP: 15,
      type: "ELECTRIC",
      category: "SPECIAL",
      priority: 2,
      effects: {
        increaseCritical: { percent: 1 }
      },
      description: `Always results in a critical hit.`
    },
    "Spite": {
      name: "Spite",
      startingPP: 10,
      type: "GHOST",
      category: "STATUS",
      effects: {
        targetLastMoveLosesPP: true
      },
      description: `Cuts 5 PP from the target's last move.`,
      soundEffect: "attack_psychic_special.mp3"
    },
    "Flail": {
      name: "Flail",
      startingPP: 15,
      type: "NORMAL",
      category: "PHYSICAL",
      effects: {
        powerHigherWhenHpLower: true
      },
      description: `Becomes more powerful the less HP the user has.`
    },
    "Reversal": {
      name: "Reversal",
      startingPP: 15,
      type: "FIGHTING",
      category: "PHYSICAL",
      effects: {
        powerHigherWhenHpLower: true
      },
      description: `Becomes more powerful the less HP the user has.`
    },
    "Eruption": {
      name: "Eruption",
      power: 150,
      startingPP: 5,
      type: "FIRE",
      category: "SPECIAL",
      effects: {
        powerMultipliedByHpPercent: true
      },
      description: `The higher the user\u2019s HP, the more powerful this attack becomes.`,
      soundEffect: "attack_fire_long.mp3"
    },
    "Water Spout": {
      name: "Water Spout",
      power: 150,
      startingPP: 5,
      type: "WATER",
      category: "SPECIAL",
      effects: {
        powerMultipliedByHpPercent: true
      },
      description: `The higher the user\u2019s HP, the more powerful this attack becomes.`,
      soundEffect: "attack_water_long.mp3"
    },
    "Reflect": {
      name: "Reflect",
      startingPP: 20,
      type: "PSYCHIC",
      category: "STATUS",
      effects: {
        reflect: true
      },
      description: `Weakens physical attacks for five turns.`,
      soundEffect: "status_reflect.mp3"
    },
    "Light Screen": {
      name: "Light Screen",
      startingPP: 30,
      type: "PSYCHIC",
      category: "STATUS",
      effects: {
        lightScreen: true
      },
      description: `Weakens special attacks for five turns.`,
      soundEffect: "status_reflect.mp3"
    },
    "Psystrike": {
      name: "Psystrike",
      startingPP: 10,
      type: "PSYCHIC",
      power: 100,
      category: "SPECIAL",
      effects: {
        useDefenseForDamageCalc: true
      },
      description: `Inflicts damage based on the target's Defense instead of Special Defense.`,
      soundEffect: "attack_ghost.mp3"
    },
    "Psyshock": {
      name: "Psyshock",
      startingPP: 10,
      type: "PSYCHIC",
      power: 100,
      category: "SPECIAL",
      effects: {
        useDefenseForDamageCalc: true
      },
      description: `Inflicts damage based on the target's Defense instead of Special Defense.`,
      soundEffect: "attack_electric.mp3"
    },
    "Dazzling Gleam": {
      name: "Dazzling Gleam",
      startingPP: 10,
      type: "FAIRY",
      power: 80,
      category: "SPECIAL"
    },
    "Coil": {
      name: "Coil",
      startingPP: 20,
      type: "POISON",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        modifyStages: { modifiers: [
          { chance: 1, stageStat: "attack", stages: 1, userOrTarget: "USER" },
          { chance: 1, stageStat: "defense", stages: 1, userOrTarget: "USER" },
          { chance: 1, stageStat: "accuracy", stages: 1, userOrTarget: "USER" }
        ] }
      },
      description: `Raises user's attack, defense and accuracy.`,
      soundEffect: "status_buff.mp3"
    },
    "Transform": {
      name: "Transform",
      startingPP: 10,
      type: "NORMAL",
      category: "STATUS",
      effects: {
        transformIntoTarget: true,
        ignoreAccuracyAndEvasion: true
      },
      description: `User takes on the form and attacks of the target.`
    },
    "Conversion 2": {
      name: "Conversion 2",
      startingPP: 30,
      type: "NORMAL",
      category: "STATUS",
      effects: {
        replaceUserTypesBasedOnTargetLastMove: true,
        ignoreAccuracyAndEvasion: true
      },
      description: `Changes the user's type to be resistant to the last move used by the target.`,
      soundEffect: "status_transform.mp3"
    },
    "Focus Blast": {
      name: "Focus Blast",
      startingPP: 5,
      type: "FIGHTING",
      power: 120,
      category: "SPECIAL",
      accuracy: 0.7,
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "TARGET", stageStat: "specialDefense", stages: -1, chance: 0.1 }
        ] }
      },
      soundEffect: "attack_blast.mp3"
    },
    "Roar": {
      name: "Roar",
      startingPP: 20,
      type: "NORMAL",
      category: "STATUS",
      priority: -6,
      effects: {
        ignoreAccuracyAndEvasion: true,
        forceTargetSwitch: true
      },
      description: `The target switches out and is replaced with another random Pokemon.`,
      soundEffect: `status_roar.mp3`,
      soundBased: true
    },
    "Whirlwind": {
      name: "Whirlwind",
      startingPP: 20,
      type: "NORMAL",
      category: "STATUS",
      priority: -6,
      effects: {
        ignoreAccuracyAndEvasion: true,
        forceTargetSwitch: true
      },
      description: `The target switches out and is replaced with another random Pokemon.`,
      soundEffect: `attack_howling_wind.mp3`
    },
    "Dragon Tail": {
      name: "Dragon Tail",
      power: 60,
      accuracy: 0.9,
      startingPP: 10,
      type: "DRAGON",
      category: "PHYSICAL",
      priority: -6,
      effects: {
        forceTargetSwitch: true
      },
      description: `The target switches out and is replaced with another random Pokemon.`
    },
    "Circle Throw": {
      name: "Circle Throw",
      power: 60,
      accuracy: 0.9,
      startingPP: 10,
      type: "FIGHTING",
      category: "PHYSICAL",
      priority: -6,
      effects: {
        forceTargetSwitch: true
      },
      description: `The target switches out and is replaced with another random Pokemon.`
    },
    "Power Gem": {
      name: "Power Gem",
      startingPP: 10,
      type: "ROCK",
      power: 80,
      category: "SPECIAL",
      priority: 0,
      accuracy: 1
    },
    "Blizzard": {
      name: "Blizzard",
      startingPP: 5,
      type: "ICE",
      power: 110,
      category: "SPECIAL",
      accuracy: 0.85,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{ type: "FROZEN", chance: 0.1 }]
        }
      }
    },
    "Counter": {
      name: "Counter",
      startingPP: 20,
      type: "FIGHTING",
      category: "PHYSICAL",
      priority: -5,
      effects: {
        doubleDamageTaken: {
          categoryRestriction: "PHYSICAL"
        }
      }
    },
    "Mirror Coat": {
      name: "Mirror Coat",
      startingPP: 20,
      type: "PSYCHIC",
      category: "SPECIAL",
      priority: -5,
      effects: {
        doubleDamageTaken: {
          categoryRestriction: "SPECIAL"
        }
      }
    },
    "Payback": {
      name: "Payback",
      startingPP: 10,
      type: "DARK",
      power: 50,
      category: "PHYSICAL",
      effects: {
        doublePowerIfDamagedFirst: true
      }
    },
    "Revenge": {
      name: "Revenge",
      startingPP: 10,
      type: "FIGHTING",
      power: 60,
      category: "PHYSICAL",
      priority: -4,
      effects: {
        doublePowerIfDamagedFirst: true
      }
    },
    "Bolt Strike": {
      name: "Bolt Strike",
      startingPP: 5,
      type: "ELECTRIC",
      power: 130,
      accuracy: 0.85,
      category: "PHYSICAL",
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ type: "PARALYZED", chance: 0.2 }] }
      }
    },
    "Avalanche": {
      name: "Avalanche",
      startingPP: 10,
      type: "ICE",
      power: 60,
      category: "PHYSICAL",
      priority: -4,
      effects: {
        doublePowerIfDamagedFirst: true
      },
      soundEffect: "attack_ice_crash.mp3"
    },
    "Metronome": {
      name: "Metronome",
      startingPP: 10,
      type: "NORMAL",
      category: "STATUS",
      soundEffect: "status_metronome.mp3",
      effects: {
        randomMove: {
          moveNames: [
            "Ice Punch",
            "Sludge Bomb",
            "Smokescreen",
            "Body Slam",
            "Leaf Storm",
            "Will-O-Wisp",
            "Thunder Wave",
            "Thunder",
            "Toxic",
            "Fire Blast",
            "Heat Wave",
            "Magma Storm",
            "Waterfall",
            "Muddy Water",
            "Strange Steam",
            "Diamond Storm",
            "Icicle Crash",
            "Moonblast",
            "Discharge",
            "Play Rough",
            "Ice Beam",
            "Leech Life",
            "Poison Jab",
            "Superpower",
            "Petal Blizzard",
            "Hurricane",
            "Psychic",
            "Earth Power",
            "Stone Edge",
            "Shadow Ball",
            "Dark Pulse",
            "Hammer Arm",
            "Sing",
            "Searing Shot",
            "V-create"
          ]
        }
      }
    },
    "Icy Wind": {
      name: "Icy Wind",
      startingPP: 15,
      type: "ICE",
      power: 55,
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "TARGET", stageStat: "speed", stages: -1, chance: 1 }
        ] }
      }
    },
    "Draco Meteor": {
      name: "Draco Meteor",
      startingPP: 5,
      type: "DRAGON",
      power: 130,
      category: "SPECIAL",
      accuracy: 0.9,
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "specialAttack", stages: -2, chance: 1 }
        ] }
      },
      soundEffect: "attack_flamethrower.mp3"
    },
    "Leaf Storm": {
      name: "Leaf Storm",
      startingPP: 5,
      type: "GRASS",
      power: 130,
      category: "SPECIAL",
      accuracy: 0.9,
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "specialAttack", stages: -2, chance: 1 }
        ] }
      },
      soundEffect: "attack_grass_long.mp3"
    },
    "Psycho Boost": {
      name: "Psycho Boost",
      startingPP: 5,
      type: "PSYCHIC",
      power: 140,
      category: "SPECIAL",
      accuracy: 0.9,
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "specialAttack", stages: -2, chance: 1 }
        ] }
      },
      soundEffect: "attack_blast.mp3"
    },
    "Overheat": {
      name: "Overheat",
      startingPP: 5,
      type: "FIRE",
      power: 130,
      category: "SPECIAL",
      accuracy: 0.9,
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "specialAttack", stages: -2, chance: 1 }
        ] }
      },
      soundEffect: "attack_fire_long.mp3"
    },
    "Play Rough": {
      name: "Play Rough",
      startingPP: 10,
      type: "FAIRY",
      power: 90,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "TARGET", stageStat: "attack", stages: -1, chance: 0.1 }
        ] }
      },
      soundEffect: "attack_slap.mp3"
    },
    "Lunge": {
      name: "Lunge",
      startingPP: 15,
      type: "BUG",
      power: 80,
      category: "PHYSICAL",
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "TARGET", stageStat: "attack", stages: -1, chance: 1 }
        ] }
      }
    },
    "Meteor Mash": {
      name: "Meteor Mash",
      startingPP: 10,
      type: "STEEL",
      power: 90,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "attack", stages: 1, chance: 0.2 }
        ] }
      },
      soundEffect: "attack_blast.mp3"
    },
    "Surf": {
      name: "Surf",
      startingPP: 15,
      type: "WATER",
      power: 90,
      category: "SPECIAL",
      accuracy: 1,
      soundEffect: "attack_water_long.mp3"
    },
    "Mirror Move": {
      name: "Mirror Move",
      startingPP: 20,
      type: "FLYING",
      category: "STATUS",
      soundEffect: "status_mirror_move.mp3",
      effects: {
        copyTargetLastMove: true
      }
    },
    "Copycat": {
      name: "Copycat",
      startingPP: 20,
      type: "NORMAL",
      category: "STATUS",
      soundEffect: "status_copycat.mp3",
      effects: {
        copyTargetLastMove: true
      }
    },
    "Wrap": {
      name: "Wrap",
      startingPP: 20,
      type: "NORMAL",
      power: 15,
      category: "PHYSICAL",
      priority: 0,
      accuracy: 1,
      effects: {
        applyBind: true
      }
    },
    "Amnesia": {
      name: "Amnesia",
      startingPP: 20,
      type: "PSYCHIC",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "specialDefense", stages: 2, chance: 1 }
        ] }
      }
    },
    "Diamond Storm": {
      name: "Diamond Storm",
      startingPP: 5,
      type: "ROCK",
      power: 100,
      category: "PHYSICAL",
      accuracy: 0.95,
      soundEffect: "attack_generic_long.mp3",
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "defense", stages: 2, chance: 0.5 }
        ] }
      },
      makesContact: false
    },
    "Iron Tail": {
      name: "Iron Tail",
      startingPP: 15,
      type: "STEEL",
      power: 100,
      category: "PHYSICAL",
      accuracy: 0.75,
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "TARGET", stageStat: "defense", stages: -1, chance: 0.3 }
        ] }
      }
    },
    "Fire Spin": {
      name: "Fire Spin",
      startingPP: 15,
      type: "FIRE",
      power: 35,
      category: "SPECIAL",
      effects: {
        applyBind: true
      },
      soundEffect: "attack_fire_long.mp3"
    },
    "Dragon Pulse": {
      name: "Dragon Pulse",
      startingPP: 10,
      type: "DRAGON",
      power: 85,
      category: "SPECIAL",
      soundEffect: `attack_dragon_pulse.mp3`
    },
    "Magma Storm": {
      name: "Magma Storm",
      startingPP: 5,
      type: "FIRE",
      power: 120,
      category: "SPECIAL",
      accuracy: 0.75,
      effects: {
        applyBind: true
      },
      soundEffect: "attack_fire_long.mp3"
    },
    "Whirlpool": {
      name: "Whirlpool",
      startingPP: 15,
      type: "WATER",
      power: 35,
      category: "SPECIAL",
      effects: {
        applyBind: true
      },
      soundEffect: "attack_water_long.mp3"
    },
    "Earth Power": {
      name: "Earth Power",
      startingPP: 10,
      type: "GROUND",
      power: 80,
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "TARGET", stageStat: "specialDefense", stages: -1, chance: 0.2 }
        ] }
      },
      soundEffect: "attack_ground_long.mp3"
    },
    "Sludge Bomb": {
      name: "Sludge Bomb",
      startingPP: 10,
      type: "POISON",
      power: 90,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ type: "POISONED", chance: 0.3 }] }
      }
    },
    "Sludge Wave": {
      name: "Sludge Wave",
      startingPP: 10,
      type: "POISON",
      power: 95,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ type: "POISONED", chance: 0.1 }] }
      }
    },
    "Poison Jab": {
      name: "Poison Jab",
      startingPP: 20,
      type: "POISON",
      power: 80,
      category: "PHYSICAL",
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ type: "POISONED", chance: 0.3 }] }
      }
    },
    "Gunk Shot": {
      name: "Gunk Shot",
      startingPP: 5,
      type: "POISON",
      power: 120,
      category: "PHYSICAL",
      accuracy: 0.8,
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ type: "POISONED", chance: 0.3 }] }
      },
      makesContact: false
    },
    "Last Resort": {
      name: "Last Resort",
      startingPP: 5,
      type: "NORMAL",
      power: 140,
      category: "PHYSICAL",
      effects: {
        lastResort: true
      }
    },
    "Shadow Ball": {
      name: "Shadow Ball",
      startingPP: 15,
      type: "GHOST",
      power: 80,
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "TARGET", stageStat: "specialDefense", stages: -1, chance: 0.2 }
        ] }
      }
    },
    "Body Slam": {
      name: "Body Slam",
      startingPP: 15,
      type: "NORMAL",
      power: 80,
      category: "PHYSICAL",
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ type: "PARALYZED", chance: 0.3 }] }
      },
      soundEffect: "attack_generic_long.mp3"
    },
    "Superpower": {
      name: "Superpower",
      startingPP: 5,
      type: "FIGHTING",
      power: 120,
      category: "PHYSICAL",
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "attack", stages: -1, chance: 1 },
          { userOrTarget: "USER", stageStat: "defense", stages: -1, chance: 1 }
        ] }
      },
      soundEffect: "attack_generic_long.mp3"
    },
    "Close Combat": {
      name: "Close Combat",
      startingPP: 5,
      type: "FIGHTING",
      power: 120,
      category: "PHYSICAL",
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "defense", stages: -1, chance: 1 },
          { userOrTarget: "USER", stageStat: "specialDefense", stages: -1, chance: 1 }
        ] }
      },
      soundEffect: "attack_generic_long.mp3"
    },
    "V-create": {
      name: "V-create",
      startingPP: 5,
      type: "FIRE",
      power: 180,
      category: "PHYSICAL",
      effects: {
        modifyStages: { modifiers: [
          { userOrTarget: "USER", stageStat: "defense", stages: -1, chance: 1 },
          { userOrTarget: "USER", stageStat: "specialDefense", stages: -1, chance: 1 },
          { userOrTarget: "USER", stageStat: "speed", stages: -1, chance: 1 }
        ] }
      },
      description: `Lower's user's defense, special defense and speed by one stage.`,
      soundEffect: "attack_ground_long.mp3"
    },
    "Cross Chop": {
      name: "Cross Chop",
      startingPP: 5,
      type: "FIGHTING",
      power: 85,
      category: "PHYSICAL",
      effects: {
        increaseCritical: { percent: 1 / 8 }
      }
    },
    "Poison Fang": {
      name: "Poison Fang",
      startingPP: 15,
      type: "POISON",
      power: 50,
      category: "PHYSICAL",
      priority: 0,
      accuracy: 1,
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ type: "BADLY POISONED", chance: 0.5 }] }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Iron Head": {
      name: "Iron Head",
      startingPP: 15,
      type: "STEEL",
      power: 80,
      category: "PHYSICAL",
      priority: 0,
      accuracy: 1,
      effects: {
        flinchTarget: { chance: 0.3 }
      }
    },
    "Icicle Crash": {
      name: "Icicle Crash",
      startingPP: 10,
      type: "ICE",
      power: 85,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        flinchTarget: { chance: 0.3 }
      },
      soundEffect: "attack_ice_crash.mp3",
      makesContact: false
    },
    "Zen Headbutt": {
      name: "Zen Headbutt",
      startingPP: 15,
      type: "PSYCHIC",
      power: 80,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        flinchTarget: { chance: 0.2 }
      }
    },
    "Waterfall": {
      name: "Waterfall",
      startingPP: 15,
      type: "WATER",
      power: 80,
      category: "PHYSICAL",
      effects: {
        flinchTarget: { chance: 0.2 }
      },
      soundEffect: "attack_water_long_crash.mp3"
    },
    "Rock Slide": {
      name: "Rock Slide",
      startingPP: 10,
      type: "ROCK",
      power: 75,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        flinchTarget: { chance: 0.3 }
      }
    },
    "Dragon Rush": {
      name: "Dragon Rush",
      startingPP: 10,
      type: "DRAGON",
      power: 80,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        flinchTarget: { chance: 0.2 }
      }
    },
    "Strange Steam": {
      name: "Strange Steam",
      startingPP: 10,
      type: "FAIRY",
      power: 90,
      category: "SPECIAL",
      accuracy: 0.95,
      effects: {
        applyConfusion: { chance: 0.2 }
      }
    },
    "Hurricane": {
      name: "Hurricane",
      startingPP: 10,
      type: "FLYING",
      power: 110,
      category: "SPECIAL",
      accuracy: 0.7,
      stormRelated: true,
      effects: {
        applyConfusion: { chance: 0.5 }
      },
      soundEffect: "attack_howling_wind.mp3"
    },
    "Petal Blizzard": {
      name: "Petal Blizzard",
      startingPP: 15,
      type: "GRASS",
      power: 90,
      category: "PHYSICAL",
      accuracy: 1,
      makesContact: false
    },
    "Dragon Claw": {
      name: "Dragon Claw",
      startingPP: 10,
      type: "DRAGON",
      power: 80,
      category: "PHYSICAL",
      accuracy: 1
    },
    "Foul Play": {
      name: "Foul Play",
      startingPP: 15,
      type: "DARK",
      power: 95,
      category: "PHYSICAL",
      effects: {
        useTargetAttack: true
      },
      description: `Uses the target's Attack stat instead of the user's in damage calculation.`,
      soundEffect: "attack_slash_special.mp3"
    },
    "Brine": {
      name: "Brine",
      power: 65,
      startingPP: 10,
      type: "WATER",
      category: "SPECIAL",
      description: `Power doubles if opponent's HP is less than 50%.`,
      soundEffect: "attack_water_long.mp3"
    },
    "Brick Break": {
      name: "Brick Break",
      startingPP: 15,
      type: "FIGHTING",
      power: 75,
      category: "PHYSICAL",
      priority: 0,
      accuracy: 1,
      effects: { breakScreens: true },
      description: `Breaks barriers such as Light Screen and Reflect before attacking.`,
      soundEffect: "attack_double_punch.mp3"
    },
    "Sticky Web": {
      name: "Sticky Web",
      startingPP: 20,
      type: "BUG",
      category: "STATUS",
      effects: {
        setStickyWeb: true,
        ignoreAccuracyAndEvasion: true
      },
      description: `Weaves a sticky net around the opposing team, which lowers their speed upon switching in.`,
      soundEffect: "status_entry_hazard.mp3"
    },
    "Stealth Rock": {
      name: "Stealth Rock",
      startingPP: 20,
      type: "ROCK",
      category: "STATUS",
      effects: {
        setStealthRock: true,
        ignoreAccuracyAndEvasion: true
      },
      description: `Lays a trap of levitating stones around the opposing team, which damages them upon switching in.`,
      soundEffect: "status_stealth_rock.mp3"
    },
    "Spikes": {
      name: "Spikes",
      startingPP: 20,
      type: "GROUND",
      category: "STATUS",
      effects: {
        setSpikes: true,
        ignoreAccuracyAndEvasion: true
      },
      description: `Lays a trap of spikes at the opposing team\u2019s feet, which damages them upon switching in.`,
      soundEffect: "status_entry_hazard.mp3"
    },
    "Toxic Spikes": {
      name: "Toxic Spikes",
      startingPP: 20,
      type: "POISON",
      category: "STATUS",
      effects: {
        setToxicSpikes: true,
        ignoreAccuracyAndEvasion: true
      },
      description: `Lays a trap of poison spikes at the opposing team\u2019s feet, which poisons them upon switching in.`,
      soundEffect: "status_entry_hazard.mp3"
    },
    "Psychic": {
      name: "Psychic",
      startingPP: 10,
      type: "PSYCHIC",
      power: 90,
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [{ userOrTarget: "TARGET", stageStat: "specialDefense", stages: -1, chance: 0.1 }] }
      },
      soundEffect: "attack_ripple.mp3"
    },
    "Crunch": {
      name: "Crunch",
      startingPP: 15,
      type: "DARK",
      power: 80,
      category: "PHYSICAL",
      effects: {
        modifyStages: { modifiers: [{ userOrTarget: "TARGET", stageStat: "defense", stages: -1, chance: 0.2 }] }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Bug Buzz": {
      name: "Bug Buzz",
      startingPP: 10,
      type: "BUG",
      power: 90,
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [{ userOrTarget: "TARGET", stageStat: "specialDefense", stages: -1, chance: 0.1 }] }
      },
      soundEffect: "attack_ripple.mp3",
      soundBased: true
    },
    "Breaking Swipe": {
      name: "Breaking Swipe",
      startingPP: 15,
      type: "DRAGON",
      power: 60,
      category: "PHYSICAL",
      effects: {
        modifyStages: { modifiers: [{ userOrTarget: "TARGET", stageStat: "attack", stages: -1, chance: 1 }] }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Energy Ball": {
      name: "Energy Ball",
      startingPP: 10,
      type: "GRASS",
      power: 90,
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [{ userOrTarget: "TARGET", stageStat: "specialDefense", stages: -1, chance: 0.1 }] }
      },
      soundEffect: "attack_ripple.mp3"
    },
    "Moonblast": {
      name: "Moonblast",
      startingPP: 10,
      type: "FAIRY",
      power: 95,
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [{ userOrTarget: "TARGET", stageStat: "specialDefense", stages: -1, chance: 0.25 }] }
      }
    },
    "Fire Fang": {
      name: "Fire Fang",
      startingPP: 15,
      type: "FIRE",
      power: 65,
      category: "PHYSICAL",
      accuracy: 0.95,
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ chance: 0.1, type: "BURNED" }] },
        flinchTarget: { chance: 0.1 }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Ice Fang": {
      name: "Ice Fang",
      startingPP: 15,
      type: "ICE",
      power: 65,
      category: "PHYSICAL",
      accuracy: 0.95,
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ chance: 0.1, type: "FROZEN" }] },
        flinchTarget: { chance: 0.1 }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Thunder Fang": {
      name: "Thunder Fang",
      startingPP: 15,
      type: "ELECTRIC",
      power: 65,
      category: "PHYSICAL",
      accuracy: 0.95,
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ chance: 0.1, type: "PARALYZED" }] },
        flinchTarget: { chance: 0.1 }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Dragon Breath": {
      name: "Dragon Breath",
      startingPP: 10,
      type: "DRAGON",
      power: 60,
      category: "SPECIAL",
      priority: 0,
      accuracy: 1,
      effects: {
        applyNonVolatileStatusConditions: { conditions: [{ chance: 0.3, type: "PARALYZED" }] }
      },
      soundEffect: "attack_generic_long.mp3"
    },
    "Struggle": {
      name: "Struggle",
      startingPP: 1,
      type: "NORMAL",
      power: 50,
      category: "PHYSICAL",
      effects: {
        ignoreAccuracyAndEvasion: true,
        recoilBasedOnUserHP: {
          percent: 1 / 4,
          showRecoilText: true
        }
      },
      description: `Only usable when all PP are gone. Also hurts the user.`
    },
    "Belly Drum": {
      name: "Belly Drum",
      startingPP: 10,
      type: "NORMAL",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        recoilBasedOnUserHP: {
          percent: 1 / 2,
          showRecoilText: false
        },
        maximizeAttack: true
      },
      soundEffect: "status_belly_drum.mp3",
      description: `User loses 50% of its max HP, but Attack raises to maximum.`
    },
    "Gyro Ball": {
      name: "Gyro Ball",
      startingPP: 5,
      type: "STEEL",
      category: "PHYSICAL",
      accuracy: 1,
      soundEffect: "attack_ground_long.mp3",
      effects: { powerHigherWhenSpeedLower: true },
      description: `The slower the user compared to the target, the greater the move\u2019s power.`
    },
    "Brutal Swing": {
      name: "Brutal Swing",
      startingPP: 15,
      type: "DARK",
      power: 70,
      category: "PHYSICAL",
      accuracy: 1,
      soundEffect: "attack_slash.mp3"
    },
    "Quick Attack": {
      name: "Quick Attack",
      startingPP: 30,
      type: "NORMAL",
      power: 40,
      category: "PHYSICAL",
      priority: 1,
      accuracy: 1,
      description: `Attacks with increased priority.`
    },
    "Sucker Punch": {
      name: "Sucker Punch",
      startingPP: 5,
      type: "DARK",
      power: 70,
      category: "PHYSICAL",
      priority: 1,
      effects: {
        ignoreAccuracyAndEvasion: true,
        suckerPunch: true
      },
      description: `Attacks first but fails if target is not preparing an attack.`
    },
    "Shadow Sneak": {
      name: "Shadow Sneak",
      startingPP: 30,
      type: "GHOST",
      power: 40,
      category: "PHYSICAL",
      priority: 1,
      accuracy: 1,
      description: `Attacks with increased priority.`
    },
    "Extreme Speed": {
      name: "Extreme Speed",
      startingPP: 5,
      type: "NORMAL",
      power: 80,
      category: "PHYSICAL",
      priority: 2,
      accuracy: 1,
      description: `Always attacks first.`,
      soundEffect: "attack_slash_special.mp3"
    },
    "Ice Shard": {
      name: "Ice Shard",
      startingPP: 30,
      type: "ICE",
      power: 40,
      category: "PHYSICAL",
      priority: 1,
      soundEffect: "attack_slash.mp3"
    },
    "Aqua Tail": {
      name: "Aqua Tail",
      startingPP: 10,
      type: "WATER",
      power: 90,
      category: "PHYSICAL",
      accuracy: 0.9
    },
    "Aqua Jet": {
      name: "Aqua Jet",
      startingPP: 20,
      type: "WATER",
      power: 40,
      category: "PHYSICAL",
      priority: 1,
      accuracy: 1,
      description: `Attacks with increased priority.`,
      soundEffect: "attack_generic.mp3"
    },
    "Mud Shot": {
      name: "Mud Shot",
      startingPP: 15,
      type: "GROUND",
      power: 55,
      category: "SPECIAL",
      accuracy: 0.95,
      effects: {
        modifyStages: {
          modifiers: [
            { userOrTarget: "TARGET", stageStat: "speed", stages: -1, chance: 1 }
          ]
        }
      }
    },
    "Hammer Arm": {
      name: "Hammer Arm",
      startingPP: 10,
      type: "FIGHTING",
      power: 100,
      category: "PHYSICAL",
      effects: {
        modifyStages: {
          modifiers: [
            { userOrTarget: "USER", stageStat: "speed", stages: -1, chance: 1 }
          ]
        }
      }
    },
    "Flame Charge": {
      name: "Flame Charge",
      startingPP: 15,
      type: "FIRE",
      power: 60,
      category: "PHYSICAL",
      effects: {
        modifyStages: {
          modifiers: [
            { userOrTarget: "USER", stageStat: "speed", stages: 1, chance: 1 }
          ]
        }
      }
    },
    "Shell Smash": {
      name: "Shell Smash",
      startingPP: 15,
      type: "NORMAL",
      category: "STATUS",
      soundEffect: "status_shell_smash.mp3",
      description: `Lowers user's defense and special defense but raises user's attack, special attack and speed.`,
      effects: {
        modifyStages: {
          modifiers: [
            { userOrTarget: "USER", stageStat: "defense", stages: -1, chance: 1 },
            { userOrTarget: "USER", stageStat: "specialDefense", stages: -1, chance: 1 },
            { userOrTarget: "USER", stageStat: "attack", stages: 2, chance: 1 },
            { userOrTarget: "USER", stageStat: "specialAttack", stages: 2, chance: 1 },
            { userOrTarget: "USER", stageStat: "speed", stages: 2, chance: 1 }
          ]
        }
      }
    },
    "Megahorn": {
      name: "Megahorn",
      startingPP: 10,
      type: "BUG",
      power: 120,
      category: "PHYSICAL",
      accuracy: 0.85
    },
    "Drill Peck": {
      name: "Drill Peck",
      startingPP: 10,
      type: "FLYING",
      power: 80,
      category: "PHYSICAL",
      accuracy: 1
    },
    "Thunder Punch": {
      name: "Thunder Punch",
      startingPP: 15,
      type: "ELECTRIC",
      power: 75,
      category: "PHYSICAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "PARALYZED",
            chance: 0.1
          }]
        }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Ice Punch": {
      name: "Ice Punch",
      startingPP: 15,
      type: "ICE",
      power: 75,
      category: "PHYSICAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "FROZEN",
            chance: 0.1
          }]
        }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Fire Punch": {
      name: "Fire Punch",
      startingPP: 15,
      type: "FIRE",
      power: 75,
      category: "PHYSICAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.1
          }]
        }
      }
    },
    "Lava Plume": {
      name: "Lava Plume",
      startingPP: 15,
      type: "FIRE",
      power: 80,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.4
          }]
        }
      }
    },
    "Tri Attack": {
      name: "Tri Attack",
      startingPP: 10,
      type: "NORMAL",
      power: 80,
      category: "SPECIAL",
      description: "20% chance of burning, paralyzing or freezing",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [
            { type: "FROZEN", chance: 0.2 },
            { type: "PARALYZED", chance: 0.2 },
            { type: "BURNED", chance: 0.2 }
          ]
        }
      },
      soundEffect: "attack_beam.mp3"
    },
    "Flame Wheel": {
      name: "Flame Wheel",
      startingPP: 15,
      type: "FIRE",
      power: 70,
      category: "PHYSICAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.2
          }]
        }
      },
      soundEffect: "attack_generic_long.mp3"
    },
    "Sacred Fire": {
      name: "Sacred Fire",
      startingPP: 5,
      type: "FIRE",
      power: 100,
      accuracy: 0.95,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.5
          }]
        }
      },
      soundEffect: "attack_fire_long.mp3"
    },
    "Sacred Sword": {
      name: "Sacred Sword",
      startingPP: 15,
      type: "FIGHTING",
      power: 90,
      category: "PHYSICAL",
      effects: {
        ignoreAccuracyAndEvasion: true
      },
      soundEffect: "attack_sacred_sword.mp3"
    },
    "Flamethrower": {
      name: "Flamethrower",
      startingPP: 15,
      type: "FIRE",
      power: 90,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.1
          }]
        }
      },
      soundEffect: "attack_flamethrower.mp3"
    },
    "Searing Shot": {
      name: "Searing Shot",
      startingPP: 5,
      type: "FIRE",
      power: 100,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.3
          }]
        }
      }
    },
    "Burn Up": {
      name: "Burn Up",
      startingPP: 5,
      type: "FIRE",
      power: 130,
      category: "SPECIAL",
      effects: {
        ignoreAccuracyAndEvasion: true,
        removeUserType: { type: "FIRE" }
      },
      soundEffect: "attack_fire_long.mp3"
    },
    "Scorching Sands": {
      name: "Scorching Sands",
      startingPP: 10,
      type: "GROUND",
      power: 70,
      category: "SPECIAL",
      priority: 0,
      accuracy: 1,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.3
          }]
        }
      },
      soundEffect: "attack_sand.mp3"
    },
    "Scald": {
      name: "Scald",
      startingPP: 15,
      type: "WATER",
      power: 80,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.4
          }]
        }
      },
      soundEffect: "attack_generic_long.mp3"
    },
    "Dark Pulse": {
      name: "Dark Pulse",
      startingPP: 15,
      type: "DARK",
      power: 80,
      category: "SPECIAL",
      effects: {
        flinchTarget: { chance: 0.2 }
      },
      soundEffect: "attack_beam.mp3"
    },
    "Fire Blast": {
      name: "Fire Blast",
      startingPP: 5,
      type: "FIRE",
      power: 110,
      category: "SPECIAL",
      accuracy: 0.85,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.1
          }]
        }
      }
    },
    "Heat Wave": {
      name: "Heat Wave",
      startingPP: 10,
      type: "FIRE",
      power: 95,
      category: "SPECIAL",
      accuracy: 0.9,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.1
          }]
        }
      }
    },
    "Hydro Pump": {
      name: "Hydro Pump",
      startingPP: 5,
      type: "WATER",
      power: 110,
      category: "SPECIAL",
      accuracy: 0.9,
      soundEffect: "attack_water_long_crash.mp3"
    },
    "Flash Cannon": {
      name: "Flash Cannon",
      startingPP: 10,
      type: "STEEL",
      power: 80,
      category: "SPECIAL",
      effects: {
        modifyStages: { modifiers: [{ userOrTarget: "TARGET", stageStat: "speed", stages: -1, chance: 0.1 }] }
      }
    },
    "Kinesis": {
      name: "Kinesis",
      startingPP: 15,
      type: "PSYCHIC",
      category: "STATUS",
      soundEffect: "status_debuff.mp3",
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: "TARGET",
            stageStat: "accuracy",
            stages: -1,
            chance: 1
          }]
        }
      }
    },
    "Smokescreen": {
      name: "Smokescreen",
      startingPP: 20,
      type: "NORMAL",
      category: "STATUS",
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: "TARGET",
            stageStat: "accuracy",
            stages: -1,
            chance: 1
          }]
        }
      }
    },
    "Rock Polish": {
      name: "Rock Polish",
      startingPP: 20,
      type: "ROCK",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        modifyStages: {
          modifiers: [{
            userOrTarget: "USER",
            stageStat: "speed",
            stages: 2,
            chance: 1
          }]
        }
      }
    },
    "Super Fang": {
      name: "Super Fang",
      startingPP: 10,
      type: "NORMAL",
      category: "PHYSICAL",
      effects: {
        halfRemainingHP: true
      },
      soundEffect: "attack_jolt.mp3"
    },
    "Mud-Slap": {
      name: "Mud-Slap",
      startingPP: 10,
      type: "GROUND",
      power: 20,
      category: "SPECIAL",
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: "TARGET",
            stageStat: "accuracy",
            stages: -1,
            chance: 1
          }]
        }
      },
      soundEffect: "attack_slap.mp3"
    },
    "Muddy Water": {
      name: "Muddy Water",
      startingPP: 10,
      type: "WATER",
      power: 90,
      category: "SPECIAL",
      accuracy: 0.85,
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: "TARGET",
            stageStat: "accuracy",
            stages: -1,
            chance: 0.3
          }]
        }
      }
    },
    "Bullet Seed": {
      name: "Bullet Seed",
      startingPP: 30,
      type: "GRASS",
      power: 25,
      category: "PHYSICAL",
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 3 / 8
            },
            {
              chance: 3 / 8
            },
            {
              chance: 1 / 8
            },
            {
              chance: 1 / 8
            }
          ]
        }
      },
      soundEffect: "attack_scratch.mp3"
    },
    "Fury Swipes": {
      name: "Fury Swipes",
      startingPP: 15,
      type: "NORMAL",
      power: 18,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 3 / 8
            },
            {
              chance: 3 / 8
            },
            {
              chance: 1 / 8
            },
            {
              chance: 1 / 8
            }
          ]
        }
      },
      soundEffect: "attack_scratch.mp3"
    },
    "Icicle Spear": {
      name: "Icicle Spear",
      startingPP: 10,
      type: "ICE",
      power: 30,
      category: "PHYSICAL",
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 3 / 8
            },
            {
              chance: 3 / 8
            },
            {
              chance: 1 / 8
            },
            {
              chance: 1 / 8
            }
          ]
        }
      },
      soundEffect: "attack_scratch.mp3",
      makesContact: false
    },
    "Bone Rush": {
      name: "Bone Rush",
      startingPP: 5,
      type: "GROUND",
      power: 10,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 3 / 8
            },
            {
              chance: 3 / 8
            },
            {
              chance: 1 / 8
            },
            {
              chance: 1 / 8
            }
          ]
        }
      },
      soundEffect: "attack_scratch.mp3"
    },
    "Scale Shot": {
      name: "Scale Shot",
      startingPP: 20,
      type: "DRAGON",
      power: 25,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 3 / 8
            },
            {
              chance: 3 / 8
            },
            {
              chance: 1 / 8
            },
            {
              chance: 1 / 8
            }
          ]
        }
      },
      soundEffect: "attack_scratch.mp3"
    },
    "Will-O-Wisp": {
      name: "Will-O-Wisp",
      startingPP: 15,
      type: "FIRE",
      category: "STATUS",
      accuracy: 0.85,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 1
          }]
        }
      }
    },
    "Thunder Wave": {
      name: "Thunder Wave",
      startingPP: 20,
      type: "ELECTRIC",
      category: "STATUS",
      accuracy: 0.9,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "PARALYZED",
            chance: 1
          }]
        }
      }
    },
    "Glare": {
      name: "Glare",
      startingPP: 30,
      type: "NORMAL",
      category: "STATUS",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "PARALYZED",
            chance: 1
          }]
        }
      }
    },
    "Bite": {
      name: "Bite",
      startingPP: 15,
      type: "DARK",
      power: 60,
      category: "PHYSICAL",
      effects: {
        flinchTarget: {
          chance: 0.3
        }
      }
    },
    "Protect": {
      name: "Protect",
      startingPP: 10,
      type: "NORMAL",
      category: "STATUS",
      priority: 4,
      soundEffect: "status_protect.mp3",
      effects: {
        protectUser: true,
        ignoreAccuracyAndEvasion: true
      }
    },
    "King's Shield": {
      name: "King's Shield",
      startingPP: 10,
      type: "STEEL",
      category: "STATUS",
      priority: 4,
      soundEffect: "status_protect.mp3",
      effects: {
        kingsShield: true,
        ignoreAccuracyAndEvasion: true
      },
      description: `Blocks direct attacks. If the attack makes contact, lowers the opponent's Attack by 2 stages.`
    },
    "Dual Wingbeat": {
      name: "Dual Wingbeat",
      startingPP: 15,
      type: "FLYING",
      power: 40,
      category: "PHYSICAL",
      accuracy: 0.9,
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 1
            }
          ]
        }
      },
      soundEffect: "attack_slap.mp3"
    },
    "Bonemerang": {
      name: "Bonemerang",
      startingPP: 10,
      type: "GROUND",
      power: 50,
      category: "PHYSICAL",
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 1
            }
          ]
        }
      },
      soundEffect: "attack_scratch.mp3"
    },
    "Flare Blitz": {
      name: "Flare Blitz",
      startingPP: 15,
      type: "FIRE",
      power: 120,
      category: "PHYSICAL",
      effects: {
        recoil: {
          percent: 1 / 3
        },
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BURNED",
            chance: 0.1
          }]
        }
      },
      description: `User receives 1/3 of the damage in recoil and 10% chance to burn`,
      soundEffect: "attack_generic_long.mp3"
    },
    "Double-Edge": {
      name: "Double-Edge",
      startingPP: 15,
      type: "NORMAL",
      power: 120,
      category: "PHYSICAL",
      effects: {
        recoil: {
          percent: 1 / 3
        }
      },
      description: `User receives 1/3 of the damage inflicted in recoil.`
    },
    "Wild Charge": {
      name: "Wild Charge",
      startingPP: 15,
      type: "ELECTRIC",
      power: 90,
      category: "PHYSICAL",
      effects: {
        recoil: {
          percent: 1 / 4
        }
      },
      description: `User receives 1/4 of the damage inflicted in recoil.`
    },
    "Head Smash": {
      name: "Head Smash",
      startingPP: 5,
      type: "ROCK",
      power: 150,
      category: "PHYSICAL",
      accuracy: 0.8,
      effects: {
        recoil: {
          percent: 1 / 2
        }
      },
      description: `User receives 1/2 of the damage inflicted in recoil.`
    },
    "Wood Hammer": {
      name: "Wood Hammer",
      startingPP: 15,
      type: "GRASS",
      power: 120,
      category: "PHYSICAL",
      effects: {
        recoil: {
          percent: 1 / 3
        }
      },
      description: `User receives 1/3 of the damage inflicted in recoil.`,
      soundEffect: "attack_rock.mp3"
    },
    "Explosion": {
      name: "Explosion",
      startingPP: 5,
      type: "NORMAL",
      power: 250,
      category: "PHYSICAL",
      effects: {
        selfDestruct: true
      },
      description: `Causes the user to faint.`,
      soundEffect: "attack_explosion.mp3",
      makesContact: false
    },
    "Hyper Fang": {
      name: "Hyper Fang",
      startingPP: 15,
      type: "NORMAL",
      power: 80,
      category: "PHYSICAL",
      effects: {
        flinchTarget: { chance: 0.1 }
      }
    },
    "Rest": {
      name: "Rest",
      startingPP: 10,
      type: "PSYCHIC",
      category: "STATUS",
      effects: {
        ignoreAccuracyAndEvasion: true,
        rest: true
      },
      description: `The user sleeps for 2 turns, restoring HP and status.`,
      soundEffect: "status_heal.mp3"
    },
    "Snore": {
      name: "Snore",
      startingPP: 15,
      type: "NORMAL",
      category: "SPECIAL",
      power: 50,
      effects: {
        failIfUserDoesntHaveStatus: { statuses: ["ASLEEP"] },
        flinchTarget: { chance: 0.3 }
      },
      description: `Only usable while asleep. 30% chance to cause target to flinch.`,
      soundEffect: "attack_snore.mp3",
      soundBased: true
    },
    "Memento": {
      name: "Memento",
      startingPP: 10,
      type: "DARK",
      category: "STATUS",
      effects: {
        modifyStages: {
          modifiers: [
            { chance: 1, stageStat: "attack", stages: -2, userOrTarget: "TARGET" },
            { chance: 1, stageStat: "specialAttack", stages: -2, userOrTarget: "TARGET" }
          ]
        },
        recoilBasedOnUserHP: {
          percent: 1,
          showRecoilText: false
        }
      },
      description: `Lowers target's Attack and Special Attack by 2 stages. The user faints.`,
      soundEffect: "status_curse.mp3"
    },
    "Air Slash": {
      name: "Air Slash",
      startingPP: 15,
      type: "FLYING",
      power: 75,
      category: "SPECIAL",
      accuracy: 0.9,
      effects: {
        flinchTarget: { chance: 0.3 }
      },
      soundEffect: "attack_slash.mp3"
    },
    "Shadow Claw": {
      name: "Shadow Claw",
      startingPP: 15,
      type: "GHOST",
      power: 70,
      category: "PHYSICAL",
      effects: {
        increaseCritical: {
          percent: 1 / 8
        }
      },
      soundEffect: "attack_slash.mp3"
    },
    "Crabhammer": {
      name: "Crabhammer",
      startingPP: 10,
      type: "WATER",
      power: 100,
      category: "PHYSICAL",
      priority: 0,
      accuracy: 0.9,
      effects: {
        increaseCritical: {
          percent: 1 / 8
        }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Slash": {
      name: "Slash",
      startingPP: 20,
      type: "NORMAL",
      power: 70,
      category: "PHYSICAL",
      effects: {
        increaseCritical: {
          percent: 1 / 8
        }
      },
      soundEffect: "attack_slash.mp3"
    },
    "Leaf Blade": {
      name: "Leaf Blade",
      startingPP: 15,
      type: "GRASS",
      power: 90,
      category: "PHYSICAL",
      effects: {
        increaseCritical: {
          percent: 1 / 8
        }
      },
      soundEffect: "attack_slash.mp3"
    },
    "Stone Edge": {
      name: "Stone Edge",
      startingPP: 5,
      type: "ROCK",
      power: 100,
      category: "PHYSICAL",
      accuracy: 0.8,
      effects: {
        increaseCritical: {
          percent: 1 / 8
        }
      },
      soundEffect: "attack_slash.mp3",
      makesContact: false
    },
    "Night Slash": {
      name: "Night Slash",
      startingPP: 15,
      type: "DARK",
      power: 75,
      category: "PHYSICAL",
      effects: {
        increaseCritical: {
          percent: 1 / 8
        }
      },
      soundEffect: "attack_slash_special.mp3"
    },
    "Razor Shell": {
      name: "Razor Shell",
      startingPP: 10,
      type: "WATER",
      power: 75,
      category: "PHYSICAL",
      accuracy: 0.95,
      effects: { modifyStages: { modifiers: [{ userOrTarget: "TARGET", stageStat: "defense", stages: -1, chance: 0.5 }] } },
      soundEffect: "attack_slash.mp3"
    },
    "Aerial Ace": {
      name: "Aerial Ace",
      startingPP: 20,
      type: "FLYING",
      power: 60,
      category: "SPECIAL",
      effects: {
        ignoreAccuracyAndEvasion: true
      }
    },
    "Swift": {
      name: "Swift",
      startingPP: 20,
      type: "NORMAL",
      power: 60,
      category: "SPECIAL",
      effects: {
        ignoreAccuracyAndEvasion: true
      }
    },
    "Shadow Punch": {
      name: "Shadow Punch",
      startingPP: 20,
      type: "GHOST",
      power: 60,
      category: "PHYSICAL",
      priority: 0,
      effects: {
        ignoreAccuracyAndEvasion: true
      }
    },
    "Sonic Boom": {
      name: "Sonic Boom",
      startingPP: 20,
      type: "NORMAL",
      category: "SPECIAL",
      effects: {
        constantDamage: {
          damage: 100
        }
      }
    },
    "Roost": {
      name: "Roost",
      startingPP: 10,
      type: "FLYING",
      category: "STATUS",
      soundEffect: "status_heal.mp3",
      effects: {
        healUser: {
          percent: 1 / 2
        },
        ignoreAccuracyAndEvasion: true,
        roost: true
      },
      description: `Restores 50% of the user's max HP. Loses FLYING type this turn`
    },
    "Recover": {
      name: "Recover",
      startingPP: 10,
      type: "NORMAL",
      category: "STATUS",
      soundEffect: "status_heal.mp3",
      effects: {
        healUser: {
          percent: 1 / 2
        },
        ignoreAccuracyAndEvasion: true
      }
    },
    "Giga Drain": {
      name: "Giga Drain",
      startingPP: 10,
      type: "GRASS",
      power: 75,
      category: "SPECIAL",
      effects: {
        drain: {
          percent: 1 / 2
        }
      },
      soundEffect: "attack_ripple.mp3"
    },
    "Leech Seed": {
      name: "Leech Seed",
      startingPP: 10,
      type: "GRASS",
      category: "STATUS",
      soundEffect: "status_leech_seed.mp3",
      effects: {
        setLeechSeed: true
      },
      description: `Plants a seed that drains health every turn`
    },
    "Leech Life": {
      name: "Leech Life",
      startingPP: 10,
      type: "BUG",
      power: 80,
      category: "PHYSICAL",
      effects: {
        drain: {
          percent: 1 / 2
        }
      }
    },
    "Ice Beam": {
      name: "Ice Beam",
      startingPP: 10,
      type: "ICE",
      power: 90,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "FROZEN",
            chance: 0.1
          }]
        }
      },
      soundEffect: "attack_beam.mp3"
    },
    "Sing": {
      name: "Sing",
      startingPP: 15,
      type: "NORMAL",
      category: "STATUS",
      accuracy: 0.55,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "ASLEEP",
            chance: 1
          }]
        }
      }
    },
    "Hypnosis": {
      name: "Hypnosis",
      startingPP: 20,
      type: "PSYCHIC",
      category: "STATUS",
      accuracy: 0.6,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "ASLEEP",
            chance: 1
          }]
        }
      }
    },
    "Toxic": {
      name: "Toxic",
      startingPP: 10,
      type: "POISON",
      category: "STATUS",
      accuracy: 0.9,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "BADLY POISONED",
            chance: 1
          }]
        }
      }
    },
    "Confuse Ray": {
      name: "Confuse Ray",
      startingPP: 10,
      type: "GHOST",
      category: "STATUS",
      soundEffect: "status_confuse_ray.mp3",
      priority: 0,
      accuracy: 1,
      effects: {
        applyConfusion: {
          chance: 1
        }
      }
    },
    "Sleep Powder": {
      name: "Sleep Powder",
      startingPP: 15,
      type: "GRASS",
      category: "STATUS",
      priority: 0,
      accuracy: 0.75,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "ASLEEP",
            chance: 1
          }]
        }
      }
    },
    "Synthesis": {
      name: "Synthesis",
      startingPP: 5,
      type: "GRASS",
      category: "STATUS",
      effects: {
        healUser: {
          percent: 1 / 2,
          modifiedByWeather: true
        },
        ignoreAccuracyAndEvasion: true
      },
      description: `Recovers 1/2 health during clear skies, 2/3 in harsh sunlight and 1/8 in other weather.`
    },
    "Rapid Spin": {
      name: "Rapid Spin",
      startingPP: 40,
      type: "NORMAL",
      power: 50,
      category: "PHYSICAL",
      effects: {
        modifyStages: {
          modifiers: [{ userOrTarget: "USER", stageStat: "speed", stages: 1, chance: 1 }]
        },
        removeUserBindAndEntryHazards: true
      },
      description: `Raises user's speed by 1 stage and removes entry hazards.`,
      soundEffect: "attack_rapid_spin.mp3"
    },
    "Steel Wing": {
      name: "Steel Wing",
      startingPP: 25,
      type: "STEEL",
      power: 70,
      accuracy: 0.9,
      category: "PHYSICAL",
      effects: {
        modifyStages: {
          modifiers: [{ userOrTarget: "USER", stageStat: "defense", stages: 1, chance: 0.1 }]
        }
      },
      soundEffect: "attack_slash_special.mp3"
    },
    "Water Pulse": {
      name: "Water Pulse",
      startingPP: 20,
      type: "WATER",
      power: 60,
      category: "SPECIAL",
      priority: 0,
      accuracy: 1,
      effects: {
        applyConfusion: {
          chance: 0.2
        }
      }
    },
    "Iron Defense": {
      name: "Iron Defense",
      startingPP: 15,
      type: "STEEL",
      category: "STATUS",
      soundEffect: "status_buff.mp3",
      effects: {
        modifyStages: {
          modifiers: [{
            stageStat: "defense",
            chance: 1,
            stages: 2,
            userOrTarget: "USER"
          }]
        }
      }
    },
    "Nasty Plot": {
      name: "Nasty Plot",
      startingPP: 20,
      type: "DARK",
      category: "STATUS",
      soundEffect: "status_buff.mp3",
      effects: {
        modifyStages: {
          modifiers: [{
            stageStat: "specialAttack",
            chance: 1,
            stages: 2,
            userOrTarget: "USER"
          }]
        }
      }
    },
    "Acid Armor": {
      name: "Acid Armor",
      startingPP: 20,
      type: "POISON",
      category: "STATUS",
      soundEffect: "status_buff.mp3",
      effects: {
        modifyStages: {
          modifiers: [{
            stageStat: "defense",
            chance: 1,
            stages: 2,
            userOrTarget: "USER"
          }]
        }
      }
    },
    "Thunder": {
      name: "Thunder",
      startingPP: 10,
      type: "ELECTRIC",
      power: 110,
      category: "SPECIAL",
      accuracy: 0.7,
      stormRelated: true,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "PARALYZED",
            chance: 0.3
          }]
        }
      },
      soundEffect: "attack_electric_long.mp3"
    },
    "Thunderbolt": {
      name: "Thunderbolt",
      startingPP: 15,
      type: "ELECTRIC",
      power: 90,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "PARALYZED",
            chance: 0.1
          }]
        }
      },
      soundEffect: "attack_electric_long.mp3"
    },
    "Nuzzle": {
      name: "Nuzzle",
      startingPP: 20,
      type: "ELECTRIC",
      power: 20,
      category: "PHYSICAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "PARALYZED",
            chance: 1
          }]
        }
      }
    },
    "Discharge": {
      name: "Discharge",
      startingPP: 15,
      type: "ELECTRIC",
      power: 80,
      category: "SPECIAL",
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            type: "PARALYZED",
            chance: 0.3
          }]
        }
      }
    },
    "Double Team": {
      name: "Double Team",
      startingPP: 15,
      type: "NORMAL",
      category: "STATUS",
      soundEffect: "status_buff.mp3",
      effects: {
        modifyStages: {
          modifiers: [{
            stageStat: "evasion",
            userOrTarget: "USER",
            stages: 1,
            chance: 1
          }]
        }
      }
    },
    "Minimize": {
      name: "Minimize",
      startingPP: 10,
      type: "NORMAL",
      category: "STATUS",
      soundEffect: "status_buff.mp3",
      effects: {
        modifyStages: {
          modifiers: [{
            stageStat: "evasion",
            userOrTarget: "USER",
            stages: 2,
            chance: 1
          }]
        },
        ignoreAccuracyAndEvasion: true
      }
    },
    "Smart Strike": {
      name: "Smart Strike",
      startingPP: 10,
      type: "STEEL",
      power: 70,
      category: "PHYSICAL",
      effects: {
        ignoreAccuracyAndEvasion: true
      }
    },
    "Soft-Boiled": {
      name: "Soft-Boiled",
      startingPP: 10,
      type: "NORMAL",
      category: "STATUS",
      soundEffect: "status_heal.mp3",
      effects: {
        healUser: {
          percent: 1 / 2
        },
        ignoreAccuracyAndEvasion: true
      }
    },
    "Charm": {
      name: "Charm",
      startingPP: 20,
      type: "FAIRY",
      category: "STATUS",
      soundEffect: "status_debuff.mp3",
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: "TARGET",
            stageStat: "attack",
            stages: -2,
            chance: 1
          }]
        }
      }
    },
    "Bulldoze": {
      name: "Bulldoze",
      startingPP: 20,
      type: "GROUND",
      power: 60,
      category: "PHYSICAL",
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: "TARGET",
            stageStat: "speed",
            stages: -1,
            chance: 1
          }]
        }
      },
      soundEffect: "attack_sand.mp3",
      makesContact: false
    },
    "Low Kick": {
      name: "Low Kick",
      startingPP: 20,
      type: "FIGHTING",
      category: "PHYSICAL",
      effects: {
        powerBasedOnTargetSize: {
          powers: {
            small: 20,
            medium: 60,
            large: 100,
            xlarge: 120
          }
        }
      },
      description: "Inflicts more damage to heavier targets",
      soundEffect: "attack_generic.mp3"
    },
    "Grass Knot": {
      name: "Grass Knot",
      startingPP: 20,
      type: "GRASS",
      category: "SPECIAL",
      effects: {
        powerBasedOnTargetSize: {
          powers: {
            small: 20,
            medium: 60,
            large: 100,
            xlarge: 120
          }
        }
      },
      description: "Inflicts more damage to heavier targets"
    },
    "Seismic Toss": {
      name: "Seismic Toss",
      startingPP: 20,
      type: "FIGHTING",
      category: "PHYSICAL",
      effects: {
        constantDamage: {
          damage: 100
        }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Mach Punch": {
      name: "Mach Punch",
      startingPP: 30,
      type: "FIGHTING",
      power: 40,
      category: "PHYSICAL",
      priority: 1,
      accuracy: 1,
      description: `Attacks with increased priority.`
    },
    "Bullet Punch": {
      name: "Bullet Punch",
      startingPP: 30,
      type: "STEEL",
      power: 40,
      category: "PHYSICAL",
      priority: 1,
      accuracy: 1,
      description: `Attacks with increased priority.`
    },
    "Power-Up Punch": {
      name: "Power-Up Punch",
      startingPP: 20,
      type: "FIGHTING",
      power: 40,
      category: "PHYSICAL",
      effects: {
        modifyStages: {
          modifiers: [{ userOrTarget: "USER", stageStat: "attack", stages: 1, chance: 1 }]
        }
      }
    },
    "Mystical Fire": {
      name: "Mystical Fire",
      startingPP: 10,
      type: "FIRE",
      power: 75,
      category: "SPECIAL",
      effects: {
        modifyStages: {
          modifiers: [{ userOrTarget: "TARGET", stageStat: "specialAttack", stages: -1, chance: 1 }]
        }
      }
    },
    "Drain Punch": {
      name: "Drain Punch",
      startingPP: 10,
      type: "FIGHTING",
      power: 60,
      category: "PHYSICAL",
      effects: {
        drain: {
          percent: 1 / 2
        }
      }
    },
    "Rock Blast": {
      name: "Rock Blast",
      startingPP: 10,
      type: "ROCK",
      power: 25,
      category: "PHYSICAL",
      priority: 0,
      accuracy: 0.9,
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 3 / 8
            },
            {
              chance: 3 / 8
            },
            {
              chance: 1 / 8
            },
            {
              chance: 1 / 8
            }
          ]
        }
      },
      soundEffect: "attack_generic.mp3",
      makesContact: false
    },
    "Hex": {
      name: "Hex",
      startingPP: 10,
      type: "GHOST",
      power: 65,
      category: "SPECIAL",
      effects: {
        doublePowerIfTargetHasStatus: { statuses: "ANY" }
      }
    },
    "Dream Eater": {
      name: "Dream Eater",
      startingPP: 15,
      type: "PSYCHIC",
      power: 100,
      category: "SPECIAL",
      effects: {
        drain: { percent: 0.5 },
        failIfTargetDoesntHaveStatus: { statuses: ["ASLEEP"] }
      }
    },
    "Venoshock": {
      name: "Venoshock",
      startingPP: 10,
      type: "POISON",
      power: 65,
      category: "SPECIAL",
      priority: 0,
      accuracy: 1,
      effects: {
        doublePowerIfTargetHasStatus: { statuses: ["POISONED", "BADLY POISONED"] }
      }
    },
    "Blaze Kick": {
      name: "Blaze Kick",
      startingPP: 10,
      type: "FIRE",
      power: 85,
      category: "PHYSICAL",
      priority: 0,
      accuracy: 0.9,
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{ type: "BURNED", chance: 0.1 }]
        },
        increaseCritical: { percent: 1 / 8 }
      }
    },
    "Low Sweep": {
      name: "Low Sweep",
      startingPP: 20,
      type: "FIGHTING",
      power: 65,
      category: "PHYSICAL",
      priority: 0,
      accuracy: 1,
      effects: {
        modifyStages: {
          modifiers: [{ userOrTarget: "TARGET", stageStat: "speed", stages: -1, chance: 1 }]
        }
      },
      soundEffect: "attack_generic.mp3"
    },
    "Earthquake": {
      name: "Earthquake",
      startingPP: 10,
      type: "GROUND",
      power: 100,
      category: "PHYSICAL",
      accuracy: 1,
      soundEffect: "attack_ground_long.mp3",
      makesContact: false
    },
    "X-Scissor": {
      name: "X-Scissor",
      startingPP: 15,
      type: "BUG",
      power: 80,
      category: "PHYSICAL",
      accuracy: 1,
      soundEffect: "attack_slash_special.mp3"
    },
    "Boomburst": {
      name: "Boomburst",
      startingPP: 10,
      type: "NORMAL",
      power: 140,
      category: "SPECIAL",
      soundEffect: "attack_ground_long.mp3",
      soundBased: true
    },
    "Hyper Voice": {
      name: "Hyper Voice",
      startingPP: 10,
      type: "NORMAL",
      power: 90,
      category: "SPECIAL",
      soundEffect: "attack_ground_long.mp3",
      soundBased: true
    },
    "Guillotine": {
      name: "Guillotine",
      startingPP: 5,
      type: "NORMAL",
      category: "PHYSICAL",
      accuracy: 0.3,
      effects: {
        oneHitKnockout: true
      },
      description: `One hit knockout. Fails if the target's level is higher than the user.`,
      soundEffect: "attack_guillotine.mp3"
    },
    "Horn Drill": {
      name: "Horn Drill",
      startingPP: 5,
      type: "NORMAL",
      category: "PHYSICAL",
      accuracy: 0.3,
      effects: {
        oneHitKnockout: true
      },
      description: `One hit knockout. Fails if the target's level is higher than the user.`
    },
    "Fissure": {
      name: "Fissure",
      startingPP: 5,
      type: "GROUND",
      category: "PHYSICAL",
      accuracy: 0.3,
      effects: {
        oneHitKnockout: true
      },
      description: `One hit knockout. Fails if the target's level is higher than the user.`,
      soundEffect: "attack_ground_long.mp3"
    },
    "Sheer Cold": {
      name: "Sheer Cold",
      startingPP: 5,
      type: "ICE",
      category: "SPECIAL",
      accuracy: 0.3,
      effects: {
        oneHitKnockout: true,
        noEffectOnType: { type: "ICE" }
      },
      description: `One hit knockout (except ICE types). Fails if the target's level is higher than the user.`,
      soundEffect: "attack_ice_shards.mp3"
    },
    "Calm Mind": {
      name: "Calm Mind",
      startingPP: 20,
      type: "PSYCHIC",
      category: "STATUS",
      soundEffect: "status_buff.mp3",
      effects: {
        modifyStages: {
          modifiers: [
            { userOrTarget: "USER", stageStat: "specialAttack", stages: 1, chance: 1 },
            { userOrTarget: "USER", stageStat: "specialDefense", stages: 1, chance: 1 }
          ]
        }
      }
    },
    "Dragon Dance": {
      name: "Dragon Dance",
      startingPP: 20,
      type: "DRAGON",
      category: "STATUS",
      soundEffect: "status_buff.mp3",
      effects: {
        modifyStages: {
          modifiers: [
            { userOrTarget: "USER", stageStat: "attack", stages: 1, chance: 1 },
            { userOrTarget: "USER", stageStat: "speed", stages: 1, chance: 1 }
          ]
        }
      }
    },
    "Swords Dance": {
      name: "Swords Dance",
      startingPP: 20,
      type: "NORMAL",
      category: "STATUS",
      soundEffect: "status_swords_dance.mp3",
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: "USER",
            stageStat: "attack",
            stages: 2,
            chance: 1
          }]
        }
      }
    }
  };

  // src/data/ability-data.ts
  var abilities = {
    "Imposter": {
      name: "Imposter",
      desc: "Transforms itself into the Pok\xE9mon it is facing.",
      transformIntoTarget: true
    },
    "Compound Eyes": {
      name: "Compound Eyes",
      desc: `Increases the Pok\xE9mon's accuracy by 30%.`,
      increaseUserAccuracy: {
        percent: 0.3
      }
    },
    "Victory Star": {
      name: "Victory Star",
      desc: `Increases the Pok\xE9mon's accuracy by 10%.`,
      increaseUserAccuracy: {
        percent: 0.1
      }
    },
    "Skill Link": {
      name: "Skill Link",
      desc: "Maximizes the number of times multistrike moves hit.",
      multiHitMax: true
    },
    "Inner Focus": {
      name: "Inner Focus",
      desc: "Prevents the Pok\xE9mon from flinching.",
      preventFlinching: true
    },
    "Sturdy": {
      name: "Sturdy",
      desc: "Cannot be knocked out with one hit.",
      preventOHKO: true
    },
    "Levitate": {
      name: "Levitate",
      desc: "Lets the Pok\xE9mon avoid GROUND attacks and spikes.",
      raised: true
    },
    "Static": {
      name: "Static",
      desc: "Contact with the Pok\xE9mon may paraylze the attacker.",
      receivingContactInflictsStatus: { status: "PARALYZED" }
    },
    "Flame Body": {
      name: "Flame Body",
      desc: "Contact with the Pok\xE9mon may burn the attacker.",
      receivingContactInflictsStatus: { status: "BURNED" }
    },
    "Poison Point": {
      name: "Poison Point",
      desc: "Contact with the Pok\xE9mon may poison the attacker.",
      receivingContactInflictsStatus: { status: "POISONED" }
    },
    "Rock Head": {
      name: "Rock Head",
      desc: "Protects the Pok\xE9mon from recoil damage",
      preventRecoil: true
    },
    "Immunity": {
      name: "Immunity",
      desc: "Prevents the Pok\xE9mon from being poisoned.",
      preventStatus: { statuses: ["POISONED", "BADLY POISONED"] }
    },
    "Insomnia": {
      name: "Insomnia",
      desc: "Prevents the Pok\xE9mon from falling asleep.",
      preventStatus: { statuses: ["ASLEEP"] }
    },
    "Limber": {
      name: "Limber",
      desc: "Prevents the Pok\xE9mon from being paralyzed.",
      preventStatus: { statuses: ["PARALYZED"] }
    },
    "Shell Armor": {
      name: "Shell Armor",
      desc: "Prevents the Pok\xE9mon from receiving a critical hit.",
      preventRecievingCrit: true
    },
    "Battle Armor": {
      name: "Battle Armor",
      desc: "Prevents the Pok\xE9mon from receiving a critical hit.",
      preventRecievingCrit: true
    },
    "Technician": {
      name: "Technician",
      desc: "Increases the power of moves that are usually 60 or less by 50%.",
      boostLowPowerMoves: true
    },
    "Filter": {
      name: "Filter",
      desc: "Reduces the damage taken from super-effective attacks by 25%.",
      reduceDamageFromReceivingSuperEffective: true
    },
    "Magic Guard": {
      name: "Magic Guard",
      desc: "Protects the Pok\xE9mon from indirect damage, such as poison or spikes.",
      preventIndirectDamage: true
    },
    "Flash Fire": {
      name: "Flash Fire",
      desc: `When hit by a FIRE move, doesn't take damage but instead raises the power of the bearer's FIRE moves by 50%.`,
      buffFromAttackType: { type: "FIRE" }
    },
    "Water Absorb": {
      name: "Water Absorb",
      desc: `Heals 1\u20444 of its maximum HP when hit by a WATER attack.`,
      healFromAttackType: { type: "WATER" }
    },
    "Volt Absorb": {
      name: "Volt Absorb",
      desc: `Heals 1\u20444 of its maximum HP when hit by an ELECTRIC attack.`,
      healFromAttackType: { type: "ELECTRIC" }
    },
    "Natural Cure": {
      name: "Natural Cure",
      desc: `Heals status problems upon switching out.`,
      removeStatusOnSwitch: true
    },
    "Regenerator": {
      name: "Regenerator",
      desc: `Restores 1/3 of its maximum HP upon switching out.`,
      healOnSwitch: true
    },
    "Intimidate": {
      name: "Intimidate",
      desc: `Lower's the opponent's attack when the ability-bearer switches in.`,
      lowerEnemyStatOnSwitchIn: { stat: "attack" }
    },
    "Torrent": {
      name: "Torrent",
      desc: `Increases the power of WATER type moves by 50% when the ability-bearer's HP falls below 1/3 of its max.`,
      pinchBoostForType: { type: "WATER" }
    },
    "Blaze": {
      name: "Blaze",
      desc: `Increases the power of FIRE type moves by 50% when the ability-bearer's HP falls below 1/3 of its max.`,
      pinchBoostForType: { type: "FIRE" }
    },
    "Overgrow": {
      name: "Overgrow",
      desc: `Increases the power of GRASS type moves by 50% when the ability-bearer's HP falls below 1/3 of its max.`,
      pinchBoostForType: { type: "GRASS" }
    },
    "Swarm": {
      name: "Swarm",
      desc: `Increases the power of BUG type moves by 50% when the ability-bearer's HP falls below 1/3 of its max.`,
      pinchBoostForType: { type: "BUG" }
    },
    "Keen Eye": {
      name: "Keen Eye",
      desc: `Prevents the Pok\xE9mon from losing accuracy.`,
      preventLoweringStats: { stats: ["accuracy"] }
    },
    "Hyper Cutter": {
      name: "Hyper Cutter",
      desc: `Prevents the Pok\xE9mon from losing attack.`,
      preventLoweringStats: { stats: ["attack"] }
    },
    "Pressure": {
      name: "Pressure",
      desc: `Enemy attacks use 2 PP instead of 1.`,
      enemyUsesExtraPP: true
    },
    "Guts": {
      name: "Guts",
      desc: `Raises attack by 50% when inflicted by a status condition.`,
      boostAttackWhenHavingStatus: true
    },
    "Marvel Scale": {
      name: "Marvel Scale",
      desc: `Raises defense by 50% when inflicted by a status condition.`,
      boostDefenseWhenHavingStatus: true
    },
    "Synchronize": {
      name: "Synchronize",
      desc: `If the opponent burns, paralyzes or poisons the ability-bearer, the opponent receives the status condition too.`,
      syncStatus: true
    },
    "Arena Trap": {
      name: "Arena Trap",
      desc: `Prevents the opponent from switching out. Doesn't work on FLYING types.`,
      preventNonRaisedEnemySwitching: true
    },
    "Shadow Tag": {
      name: "Shadow Tag",
      desc: `Prevents the opponent from switching out. Doesn't work on GHOST types.`,
      preventNonGhostEnemySwitching: true
    },
    "Early Bird": {
      name: "Early Bird",
      desc: `Awakens early from sleep.`,
      wakeUpEarly: true
    },
    "Huge Power": {
      name: "Huge Power",
      desc: `This Pok\xE9mon's Attack is doubled.`,
      doubleAttack: true
    },
    "Prankster": {
      name: "Prankster",
      desc: `Increases the priority of status moves by 1.`,
      increasePriorityOfStatusMoves: true
    },
    "Rough Skin": {
      name: "Rough Skin",
      desc: `Contact with the Pok\xE9mon inflicts damage equal to 1\u20448 of the attacker's max HP.`,
      receivingContactDoesDamage: { percent: 1 / 8 }
    },
    "Iron Barbs": {
      name: "Iron Barbs",
      desc: `Contact with the Pok\xE9mon inflicts damage equal to 1\u20448 of the attacker's max HP.`,
      receivingContactDoesDamage: { percent: 1 / 8 }
    },
    "Shed Skin": {
      name: "Shed Skin",
      desc: `1/3 chance to heal status problems at the end of each turn.`,
      chanceToRemoveUserStatusAtEndOfTurn: true
    },
    "Truant": {
      name: "Truant",
      desc: `Can\u2019t attack on consecutive turns.`,
      truant: true
    },
    "Weak Armor": {
      name: "Weak Armor",
      desc: `Being hit by physical attacks lowers Defense but sharply raises Speed.`,
      weakArmor: true
    },
    "Multiscale": {
      name: "Multiscale",
      desc: `Reduces damage by half when the Pok\xE9mon's HP is full.`,
      reduceDamageWhenHpIsFull: true
    },
    "Iron Fist": {
      name: "Iron Fist",
      desc: `Increases the power of punching moves by 20%.`,
      boostPunches: true
    },
    "Wonder Guard": {
      name: "Wonder Guard",
      desc: `Prevents damage from attacks unless they are super effective (FIRE, FLYING, ROCK, GHOST and DARK).`,
      wonderGuard: true
    },
    "Poison Touch": {
      name: "Poison Touch",
      desc: `When this Pok\xE9mon hits with a move that makes contact, 30% to poison the target.`,
      attackingWithContactInflictsStatus: { status: "POISONED" }
    },
    "Sheer Force": {
      name: "Sheer Force",
      desc: `Increases the power of moves that have beneficial secondary effects by 30%, but removes those effects.`,
      sheerForce: true
    },
    "Soundproof": {
      name: "Soundproof",
      desc: `Immune to sound-based moves such as Hyper Voice, Boomburst, Roar, Snore and Bug Buzz.`,
      soundProof: true
    },
    "Mummy": {
      name: "Mummy",
      desc: `Contact with this Pok\xE9mon changes the attacker's ability to Mummy.`,
      receivingContactGivesAbility: true
    },
    "Stance Change": {
      name: "Stance Change",
      desc: `Transforms into Blade Form before attacking and transforms into Shield Form before using King's Shield.`,
      stanceChange: true
    },
    "Bad Dreams": {
      name: "Bad Dreams",
      desc: `Damages sleeping enemies at the end of the turn.`,
      damageSleepingEnemy: true
    },
    "Sand Force": {
      name: "Sand Force",
      desc: `Raises the power of GROUND, ROCK and STEEL type moves by 30% during a sandstorm.`,
      sandForce: true
    },
    "Clear Body": {
      name: "Clear Body",
      desc: `Prevents other Pok\xE9mon from lowering its stats.`,
      preventLoweringStats: {
        stats: "ANY"
      }
    },
    "Download": {
      name: "Download",
      desc: `Raises attack or special attack based on enemy's defenses.`,
      raiseAttackOrSpecialAttackOnSwitchIn: true
    },
    "Ice Body": {
      name: "Ice Body",
      desc: `Recovers 1/16 of its maximum HP during hail at the end of each turn.`,
      healDuringWeather: "HAIL"
    },
    "Rain Dish": {
      name: "Rain Dish",
      desc: `Recovers 1/16 of its maximum HP during rain at the end of each turn.`,
      healDuringWeather: "RAIN"
    },
    "Chlorophyll": {
      name: "Chlorophyll",
      desc: `Doubles speed during harsh sunlight.`,
      doubleSpeedDuringWeather: "HARSH_SUNLIGHT"
    },
    "Sand Rush": {
      name: "Sand Rush",
      desc: `Doubles speed during a sandstorm.`,
      doubleSpeedDuringWeather: "SANDSTORM"
    },
    "Swift Swim": {
      name: "Swift Swim",
      desc: `Doubles speed during the rain.`,
      doubleSpeedDuringWeather: "RAIN"
    },
    "Snow Cloak": {
      name: "Snow Cloak",
      desc: `Raises evasion by 20% during a hail storm.`,
      raiseEvasionDuringWeather: "HAIL"
    },
    "Snow Warning": {
      name: "Snow Warning",
      desc: `Creates a hail storm when the Pok\xE9mon enters battle that lasts 5 turns.`,
      applyWeatherOnSwitchIn: "HAIL"
    },
    "Drizzle": {
      name: "Drizzle",
      desc: `Creates a rain shower when the Pok\xE9mon enters battle that lasts 5 turns.`,
      applyWeatherOnSwitchIn: "RAIN"
    },
    "Drought": {
      name: "Drought",
      desc: `Creates harsh sunlight when the Pok\xE9mon enters battle that lasts 5 turns.`,
      applyWeatherOnSwitchIn: "HARSH_SUNLIGHT"
    },
    "Sand Stream": {
      name: "Sand Stream",
      desc: `Creates a sandstorm when the Pok\xE9mon enters battle that lasts 5 turns.`,
      applyWeatherOnSwitchIn: "SANDSTORM"
    },
    "Serene Grace": {
      name: "Serene Grace",
      desc: `Doubles the chance of secondary effects from occurring (stat changes, status changes, flinching).`,
      doubleChanceOfSecondaryEffects: true
    },
    "Speed Boost": {
      name: "Speed Boost",
      desc: `Raises speed at the end of each turn.`,
      speedBoost: true
    },
    "Thick Fat": {
      name: "Thick Fat",
      desc: `Reduces damage from FIRE and ICE type moves by 50%.`,
      thickFat: true
    },
    "Pixilate": {
      name: "Pixilate",
      desc: `Causes all NORMAL moves used by the Pok\xE9mon to become FIARY type, and increase in power by 20%.`,
      pixilate: true
    },
    "Air Lock": {
      name: "Air Lock",
      desc: `Suppresses effects brought on by weather, including move power increases, end-of-turn damage and abilities.`,
      suppressWeather: true
    }
  };

  // src/data/pokemon-data.ts
  function buildPokemon(name) {
    let species = speciesList.find((species2) => species2.name.toLowerCase() === name.toLowerCase());
    if (!species) {
      throw new Error("Unknown species name " + name);
    }
    return new Pokemon(species);
  }
  var speciesList = [
    {
      name: "Venusaur",
      pokedexNumber: 3,
      types: ["GRASS", "POISON"],
      hp: 80,
      attack: 82,
      defense: 83,
      specialAttack: 100,
      specialDefense: 100,
      speed: 80,
      moves: [
        moves["Giga Drain"],
        moves["Grass Knot"],
        moves["Leech Seed"],
        moves["Toxic"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Overgrow"]
    },
    {
      name: "Charizard",
      pokedexNumber: 6,
      types: ["FIRE", "FLYING"],
      hp: 78,
      attack: 84,
      defense: 78,
      specialAttack: 109,
      specialDefense: 85,
      speed: 100,
      moves: [
        moves["Flamethrower"],
        moves["Fire Spin"],
        moves["Air Slash"],
        moves["Dragon Claw"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Blaze"]
    },
    {
      name: "Blastoise",
      pokedexNumber: 9,
      types: ["WATER"],
      hp: 79,
      attack: 83,
      defense: 100,
      specialAttack: 85,
      specialDefense: 105,
      speed: 78,
      moves: [
        moves["Hydro Pump"],
        moves["Scald"],
        moves["Flash Cannon"],
        moves["Ice Beam"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Torrent"]
    },
    {
      name: "Butterfree",
      pokedexNumber: 12,
      types: ["BUG", "FLYING"],
      hp: 60,
      attack: 45,
      defense: 50,
      specialAttack: 90,
      specialDefense: 80,
      speed: 70,
      moves: [
        moves["Giga Drain"],
        moves["Air Slash"],
        moves["Sleep Powder"],
        moves["Confuse Ray"]
      ],
      size: "small",
      imgHeight: 6,
      ability: abilities["Compound Eyes"]
    },
    {
      name: "Beedrill",
      pokedexNumber: 15,
      types: ["BUG", "POISON"],
      hp: 65,
      attack: 90,
      defense: 40,
      specialAttack: 45,
      specialDefense: 80,
      speed: 75,
      moves: [
        moves["Poison Jab"],
        moves["X-Scissor"],
        moves["Brick Break"],
        moves["Swords Dance"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Swarm"]
    },
    {
      name: "Pidgeot",
      pokedexNumber: 18,
      types: ["NORMAL", "FLYING"],
      hp: 83,
      attack: 80,
      defense: 75,
      specialAttack: 70,
      specialDefense: 70,
      speed: 101,
      moves: [
        moves["Hurricane"],
        moves["Air Slash"],
        moves["Quick Attack"],
        moves["Mirror Move"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Keen Eye"]
    },
    {
      name: "Raticate",
      pokedexNumber: 20,
      types: ["NORMAL"],
      hp: 57,
      attack: 81,
      defense: 60,
      specialAttack: 50,
      specialDefense: 70,
      speed: 97,
      moves: [
        moves["Hyper Fang"],
        moves["Super Fang"],
        moves["Fury Swipes"],
        moves["Bite"]
      ],
      size: "medium",
      imgHeight: 5,
      ability: abilities["Guts"]
    },
    {
      name: "Arbok",
      pokedexNumber: 24,
      types: ["POISON"],
      hp: 60,
      attack: 95,
      defense: 69,
      specialAttack: 65,
      specialDefense: 79,
      speed: 80,
      moves: [
        moves["Poison Jab"],
        moves["Bite"],
        moves["Dragon Tail"],
        moves["Toxic"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Shed Skin"]
    },
    {
      name: "Pikachu",
      pokedexNumber: 27,
      types: ["ELECTRIC"],
      hp: 60,
      attack: 70,
      defense: 60,
      specialAttack: 90,
      specialDefense: 80,
      speed: 120,
      moves: [
        moves["Thunderbolt"],
        moves["Zippy Zap"],
        moves["Nuzzle"],
        moves["Light Screen"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Static"]
    },
    {
      name: "Nidoqueen",
      pokedexNumber: 31,
      types: ["POISON", "GROUND"],
      hp: 106,
      attack: 99,
      defense: 87,
      specialAttack: 75,
      specialDefense: 85,
      speed: 76,
      moves: [
        moves["Poison Jab"],
        moves["Ice Beam"],
        moves["Toxic"],
        moves["Protect"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Poison Point"]
    },
    {
      name: "Nidoking",
      pokedexNumber: 34,
      types: ["POISON", "GROUND"],
      hp: 87,
      attack: 107,
      defense: 77,
      specialAttack: 98,
      specialDefense: 77,
      speed: 89,
      moves: [
        moves["Poison Jab"],
        moves["Earth Power"],
        moves["Fire Punch"],
        moves["Sludge Wave"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Sheer Force"]
    },
    {
      name: "Clefable",
      pokedexNumber: 36,
      types: ["FAIRY"],
      hp: 95,
      attack: 70,
      defense: 73,
      specialAttack: 95,
      specialDefense: 90,
      speed: 60,
      moves: [
        moves["Moonblast"],
        moves["Metronome"],
        moves["Soft-Boiled"],
        moves["Stealth Rock"]
      ],
      size: "medium",
      imgHeight: 5,
      ability: abilities["Magic Guard"]
    },
    {
      name: "Ninetales",
      pokedexNumber: 38,
      types: ["FIRE"],
      hp: 73,
      attack: 76,
      defense: 75,
      specialAttack: 81,
      specialDefense: 100,
      speed: 100,
      moves: [
        moves["Flamethrower"],
        moves["Will-O-Wisp"],
        moves["Hex"],
        moves["Dark Pulse"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Flash Fire"]
    },
    {
      name: "Onix",
      pokedexNumber: 95,
      types: ["ROCK", "GROUND"],
      hp: 59,
      attack: 59,
      defense: 160,
      specialAttack: 30,
      specialDefense: 49,
      speed: 70,
      moves: [
        moves["Earthquake"],
        moves["Stone Edge"],
        moves["Wrap"],
        moves["Rock Polish"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Sturdy"]
    },
    {
      name: "Hypno",
      pokedexNumber: 97,
      types: ["PSYCHIC"],
      hp: 85,
      attack: 73,
      defense: 70,
      specialAttack: 73,
      specialDefense: 115,
      speed: 67,
      moves: [
        moves["Hypnosis"],
        moves["Dream Eater"],
        moves["Dazzling Gleam"],
        moves["Thunder Wave"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Inner Focus"]
    },
    {
      name: "Kingler",
      pokedexNumber: 99,
      types: ["WATER"],
      hp: 55,
      attack: 130,
      defense: 115,
      specialAttack: 50,
      specialDefense: 50,
      speed: 75,
      moves: [
        moves["Crabhammer"],
        moves["X-Scissor"],
        moves["Guillotine"],
        moves["Protect"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Sheer Force"]
    },
    {
      name: "Hitmonlee",
      pokedexNumber: 106,
      types: ["FIGHTING"],
      hp: 50,
      attack: 120,
      defense: 53,
      specialAttack: 35,
      specialDefense: 110,
      speed: 87,
      moves: [
        moves["Low Sweep"],
        moves["Blaze Kick"],
        moves["Reversal"],
        moves["Rapid Spin"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Limber"]
    },
    {
      name: "Hitmonchan",
      pokedexNumber: 107,
      types: ["FIGHTING"],
      hp: 50,
      attack: 105,
      defense: 79,
      specialAttack: 35,
      specialDefense: 110,
      speed: 76,
      moves: [
        moves["Power-Up Punch"],
        moves["Drain Punch"],
        moves["Mach Punch"],
        moves["Stone Edge"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Iron Fist"]
    },
    {
      name: "Golem",
      pokedexNumber: 76,
      types: ["ROCK", "GROUND"],
      hp: 80,
      attack: 120,
      defense: 130,
      specialAttack: 55,
      specialDefense: 65,
      speed: 45,
      moves: [
        moves["Stone Edge"],
        moves["Earthquake"],
        moves["Hammer Arm"],
        moves["Explosion"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Sturdy"]
    },
    {
      name: "Slowbro",
      pokedexNumber: 80,
      types: ["WATER", "PSYCHIC"],
      hp: 95,
      attack: 75,
      specialAttack: 110,
      defense: 125,
      specialDefense: 80,
      speed: 30,
      moves: [
        moves["Surf"],
        moves["Psychic"],
        moves["Avalanche"],
        moves["Rest"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Regenerator"]
    },
    {
      name: "Gengar",
      pokedexNumber: 94,
      types: ["GHOST", "POISON"],
      hp: 60,
      attack: 65,
      defense: 60,
      specialAttack: 130,
      specialDefense: 75,
      speed: 110,
      moves: [
        moves["Shadow Ball"],
        moves["Sludge Wave"],
        moves["Confuse Ray"],
        moves["Icy Wind"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Levitate"]
    },
    {
      name: "Lapras",
      pokedexNumber: 131,
      types: ["WATER", "ICE"],
      hp: 150,
      attack: 85,
      defense: 80,
      specialAttack: 85,
      specialDefense: 95,
      speed: 60,
      moves: [
        moves["Ice Beam"],
        moves["Water Pulse"],
        moves["Whirlpool"],
        moves["Sheer Cold"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Water Absorb"]
    },
    {
      name: "Pinsir",
      pokedexNumber: 127,
      types: ["BUG"],
      hp: 65,
      attack: 125,
      defense: 100,
      specialAttack: 55,
      specialDefense: 70,
      speed: 85,
      moves: [
        moves["X-Scissor"],
        moves["Guillotine"],
        moves["Close Combat"],
        moves["Swords Dance"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Hyper Cutter"]
    },
    {
      name: "Alakazam",
      pokedexNumber: 65,
      types: ["PSYCHIC"],
      hp: 65,
      attack: 55,
      defense: 50,
      specialAttack: 135,
      specialDefense: 95,
      speed: 120,
      moves: [
        moves["Psychic"],
        moves["Focus Blast"],
        moves["Calm Mind"],
        moves["Recover"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Magic Guard"]
    },
    {
      name: "Dugtrio",
      pokedexNumber: 51,
      types: ["GROUND"],
      hp: 35,
      attack: 100,
      defense: 50,
      specialAttack: 50,
      specialDefense: 70,
      speed: 120,
      moves: [
        moves["Earthquake"],
        moves["Stone Edge"],
        moves["Scorching Sands"],
        moves["Memento"]
      ],
      size: "small",
      imgHeight: 5,
      ability: abilities["Arena Trap"]
    },
    {
      name: "Persian",
      pokedexNumber: 53,
      types: ["NORMAL"],
      hp: 65,
      attack: 70,
      defense: 60,
      specialAttack: 65,
      specialDefense: 65,
      speed: 115,
      moves: [
        moves["Fury Swipes"],
        moves["Play Rough"],
        moves["Shadow Claw"],
        moves["Payback"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Technician"]
    },
    {
      name: "Arcanine",
      pokedexNumber: 59,
      types: ["FIRE"],
      hp: 90,
      attack: 110,
      defense: 80,
      specialAttack: 100,
      specialDefense: 80,
      speed: 95,
      moves: [
        moves["Flare Blitz"],
        moves["Extreme Speed"],
        moves["Play Rough"],
        moves["Roar"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Intimidate"]
    },
    {
      name: "Machamp",
      pokedexNumber: 68,
      types: ["FIGHTING"],
      hp: 90,
      attack: 130,
      defense: 80,
      specialAttack: 65,
      specialDefense: 85,
      speed: 55,
      moves: [
        moves["Hammer Arm"],
        moves["Close Combat"],
        moves["Bullet Punch"],
        moves["Revenge"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Guts"]
    },
    {
      name: "Victreebel",
      pokedexNumber: 71,
      types: ["GRASS", "POISON"],
      hp: 80,
      attack: 105,
      defense: 65,
      specialAttack: 100,
      specialDefense: 70,
      speed: 70,
      moves: [
        moves["Leaf Storm"],
        moves["Sludge Bomb"],
        moves["Leech Life"],
        moves["Sleep Powder"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Chlorophyll"]
    },
    {
      name: "Magneton",
      pokedexNumber: 82,
      types: ["ELECTRIC", "STEEL"],
      hp: 50,
      attack: 60,
      defense: 95,
      specialAttack: 120,
      specialDefense: 70,
      speed: 70,
      moves: [
        moves["Discharge"],
        moves["Flash Cannon"],
        moves["Tri Attack"],
        moves["Thunder Wave"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Sturdy"]
    },
    {
      name: "Cloyster",
      pokedexNumber: 91,
      types: ["WATER", "ICE"],
      hp: 65,
      attack: 95,
      defense: 180,
      specialAttack: 85,
      specialDefense: 65,
      speed: 70,
      moves: [
        moves["Icicle Spear"],
        moves["Rock Blast"],
        moves["Explosion"],
        moves["Shell Smash"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Skill Link"]
    },
    {
      name: "Weezing",
      pokedexNumber: 110,
      types: ["POISON"],
      hp: 65,
      attack: 90,
      defense: 120,
      specialAttack: 85,
      specialDefense: 70,
      speed: 60,
      moves: [
        moves["Sludge Bomb"],
        moves["Heat Wave"],
        moves["Toxic"],
        moves["Payback"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Levitate"]
    },
    {
      name: "Rhydon",
      pokedexNumber: 112,
      types: ["GROUND", "ROCK"],
      hp: 105,
      attack: 130,
      defense: 120,
      specialAttack: 45,
      specialDefense: 45,
      speed: 40,
      moves: [
        moves["Earthquake"],
        moves["Double-Edge"],
        moves["Rock Blast"],
        moves["Hammer Arm"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Rock Head"]
    },
    {
      name: "Scyther",
      pokedexNumber: 123,
      types: ["BUG", "FLYING"],
      hp: 70,
      attack: 110,
      defense: 80,
      specialAttack: 55,
      specialDefense: 80,
      speed: 105,
      moves: [
        moves["X-Scissor"],
        moves["Aerial Ace"],
        moves["Quick Attack"],
        moves["Swords Dance"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Technician"]
    },
    {
      name: "Gyarados",
      pokedexNumber: 130,
      types: ["WATER", "FLYING"],
      hp: 95,
      attack: 125,
      defense: 79,
      specialAttack: 60,
      specialDefense: 100,
      speed: 81,
      moves: [
        moves["Waterfall"],
        moves["Hurricane"],
        moves["Scale Shot"],
        moves["Dragon Dance"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Intimidate"]
    },
    {
      name: "Ditto",
      pokedexNumber: 132,
      types: ["NORMAL"],
      hp: 60,
      attack: 60,
      defense: 60,
      specialAttack: 60,
      specialDefense: 60,
      speed: 60,
      moves: [
        moves["Transform"]
      ],
      size: "small",
      ability: abilities["Imposter"],
      imgHeight: 4
    },
    {
      name: "Vaporeon",
      pokedexNumber: 134,
      types: ["WATER"],
      hp: 130,
      attack: 65,
      defense: 60,
      specialAttack: 110,
      specialDefense: 95,
      speed: 65,
      moves: [
        moves["Muddy Water"],
        moves["Ice Beam"],
        moves["Water Pulse"],
        moves["Brine"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Water Absorb"]
    },
    {
      name: "Jolteon",
      pokedexNumber: 135,
      types: ["ELECTRIC"],
      hp: 65,
      attack: 65,
      defense: 60,
      specialAttack: 110,
      specialDefense: 95,
      speed: 130,
      moves: [
        moves["Thunderbolt"],
        moves["Discharge"],
        moves["Thunder Wave"],
        moves["Copycat"]
      ],
      size: "medium",
      imgHeight: 5,
      ability: abilities["Volt Absorb"]
    },
    {
      name: "Flareon",
      pokedexNumber: 136,
      types: ["FIRE"],
      hp: 65,
      attack: 130,
      defense: 60,
      specialAttack: 95,
      specialDefense: 110,
      speed: 65,
      moves: [
        moves["Flare Blitz"],
        moves["Mystical Fire"],
        moves["Scorching Sands"],
        moves["Quick Attack"]
      ],
      size: "medium",
      imgHeight: 5,
      ability: abilities["Flash Fire"]
    },
    {
      name: "Electrode",
      pokedexNumber: 101,
      types: ["ELECTRIC"],
      hp: 60,
      attack: 65,
      defense: 72,
      specialAttack: 80,
      specialDefense: 80,
      speed: 150,
      moves: [
        moves["Discharge"],
        moves["Sonic Boom"],
        moves["Thunder Wave"],
        moves["Explosion"]
      ],
      size: "small",
      imgHeight: 5,
      ability: abilities["Static"]
    },
    {
      name: "Exeggutor",
      pokedexNumber: 103,
      types: ["GRASS", "PSYCHIC"],
      hp: 95,
      attack: 95,
      defense: 85,
      specialAttack: 125,
      specialDefense: 75,
      speed: 55,
      moves: [
        moves["Leaf Storm"],
        moves["Psychic"],
        moves["Sleep Powder"],
        moves["Synthesis"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Chlorophyll"]
    },
    {
      name: "Chansey",
      pokedexNumber: 113,
      types: ["NORMAL"],
      hp: 260,
      attack: 5,
      defense: 20,
      specialAttack: 35,
      specialDefense: 105,
      speed: 50,
      moves: [
        moves["Seismic Toss"],
        moves["Thunder Wave"],
        moves["Toxic"],
        moves["Soft-Boiled"]
      ],
      size: "medium",
      imgHeight: 5,
      ability: abilities["Natural Cure"]
    },
    {
      name: "Kangaskhan",
      pokedexNumber: 115,
      types: ["NORMAL"],
      hp: 105,
      attack: 95,
      defense: 80,
      specialAttack: 40,
      specialDefense: 80,
      speed: 90,
      moves: [
        moves["Body Slam"],
        moves["Low Kick"],
        moves["Seismic Toss"],
        moves["Last Resort"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Early Bird"]
    },
    {
      name: "Starmie",
      pokedexNumber: 121,
      types: ["WATER", "PSYCHIC"],
      hp: 60,
      attack: 75,
      defense: 85,
      specialAttack: 100,
      specialDefense: 85,
      speed: 115,
      moves: [
        moves["Psychic"],
        moves["Water Pulse"],
        moves["Power Gem"],
        moves["Rapid Spin"]
      ],
      size: "small",
      imgHeight: 6,
      ability: abilities["Natural Cure"]
    },
    {
      name: "Mr. Mime",
      spriteName: "mrmime",
      pokedexNumber: 122,
      types: ["PSYCHIC", "FAIRY"],
      hp: 73,
      attack: 45,
      specialAttack: 79,
      defense: 111,
      specialDefense: 140,
      speed: 91,
      moves: [
        moves["Psychic"],
        moves["Dazzling Gleam"],
        moves["Calm Mind"],
        moves["Reflect"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Filter"]
    },
    {
      name: "Kabutops",
      pokedexNumber: 141,
      types: ["ROCK", "WATER"],
      hp: 60,
      attack: 115,
      defense: 105,
      specialAttack: 65,
      specialDefense: 70,
      speed: 80,
      moves: [
        moves["Stone Edge"],
        moves["Razor Shell"],
        moves["Leech Life"],
        moves["Night Slash"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Battle Armor"]
    },
    {
      name: "Aerodactyl",
      pokedexNumber: 142,
      types: ["ROCK", "FLYING"],
      hp: 80,
      attack: 105,
      defense: 65,
      specialAttack: 60,
      specialDefense: 75,
      speed: 130,
      moves: [
        moves["Stone Edge"],
        moves["Dual Wingbeat"],
        moves["Steel Wing"],
        moves["Stealth Rock"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Snorlax",
      pokedexNumber: 143,
      types: ["NORMAL"],
      hp: 160,
      attack: 110,
      defense: 65,
      specialAttack: 65,
      specialDefense: 110,
      speed: 30,
      moves: [
        moves["Body Slam"],
        moves["Earthquake"],
        moves["Rest"],
        moves["Snore"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Immunity"]
    },
    {
      name: "Articuno",
      pokedexNumber: 144,
      types: ["ICE", "FLYING"],
      hp: 90,
      attack: 85,
      defense: 100,
      specialAttack: 95,
      specialDefense: 125,
      speed: 85,
      moves: [
        moves["Blizzard"],
        moves["Icy Wind"],
        moves["Sheer Cold"],
        moves["Roost"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Pressure"],
      isLegendary: true
    },
    {
      name: "Zapdos",
      pokedexNumber: 145,
      types: ["ELECTRIC", "FLYING"],
      hp: 90,
      attack: 90,
      defense: 85,
      specialAttack: 125,
      specialDefense: 90,
      speed: 100,
      moves: [
        moves["Thunder"],
        moves["Hurricane"],
        moves["Drill Peck"],
        moves["Thunder Wave"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Static"],
      isLegendary: true
    },
    {
      name: "Moltres",
      pokedexNumber: 146,
      types: ["FIRE", "FLYING"],
      hp: 90,
      attack: 100,
      defense: 90,
      specialAttack: 125,
      specialDefense: 85,
      speed: 90,
      moves: [
        moves["Mystical Fire"],
        moves["Burn Up"],
        moves["Will-O-Wisp"],
        moves["Sunny Day"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Flame Body"],
      isLegendary: true
    },
    {
      name: "Dragonite",
      pokedexNumber: 149,
      types: ["DRAGON", "FLYING"],
      hp: 91,
      attack: 134,
      defense: 95,
      specialAttack: 100,
      specialDefense: 100,
      speed: 80,
      moves: [
        moves["Dragon Rush"],
        moves["Fire Punch"],
        moves["Extreme Speed"],
        moves["Dragon Tail"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Multiscale"]
    },
    {
      name: "Mewtwo",
      pokedexNumber: 150,
      types: ["PSYCHIC"],
      hp: 106,
      attack: 103,
      defense: 85,
      specialAttack: 130,
      specialDefense: 85,
      speed: 120,
      moves: [
        moves["Psystrike"],
        moves["Psychic"],
        moves["Focus Blast"],
        moves["Reflect"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Pressure"],
      isLegendary: true
    },
    {
      name: "Mew",
      pokedexNumber: 151,
      types: ["PSYCHIC"],
      hp: 100,
      attack: 100,
      defense: 100,
      specialAttack: 100,
      specialDefense: 100,
      speed: 100,
      moves: [
        moves["Psychic"],
        moves["Metronome"],
        moves["Light Screen"],
        moves["Recover"]
      ],
      size: "small",
      imgHeight: 6,
      ability: abilities["Synchronize"],
      isLegendary: true
    },
    {
      name: "Typhlosion",
      pokedexNumber: 157,
      types: ["FIRE"],
      hp: 85,
      attack: 84,
      defense: 87,
      specialAttack: 112,
      specialDefense: 88,
      speed: 103,
      moves: [
        moves["Eruption"],
        moves["Burn Up"],
        moves["Will-O-Wisp"],
        moves["Focus Blast"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Flash Fire"]
    },
    {
      name: "Crobat",
      pokedexNumber: 169,
      types: ["POISON", "FLYING"],
      hp: 85,
      attack: 90,
      defense: 80,
      specialAttack: 70,
      specialDefense: 80,
      speed: 130,
      moves: [
        moves["Super Fang"],
        moves["Leech Life"],
        moves["Poison Fang"],
        moves["Dual Wingbeat"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Inner Focus"]
    },
    {
      name: "Azumarill",
      pokedexNumber: 184,
      types: ["WATER", "FAIRY"],
      hp: 100,
      attack: 50,
      defense: 80,
      specialAttack: 60,
      specialDefense: 80,
      speed: 50,
      moves: [
        moves["Aqua Jet"],
        moves["Play Rough"],
        moves["Bulldoze"],
        moves["Belly Drum"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Huge Power"]
    },
    {
      name: "Sudowoodo",
      pokedexNumber: 185,
      types: ["ROCK"],
      hp: 70,
      attack: 100,
      defense: 115,
      specialAttack: 30,
      specialDefense: 65,
      speed: 30,
      moves: [
        moves["Head Smash"],
        moves["Wood Hammer"],
        moves["Earthquake"],
        moves["Double-Edge"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Rock Head"]
    },
    {
      name: "Espeon",
      pokedexNumber: 196,
      types: ["PSYCHIC"],
      hp: 65,
      attack: 65,
      defense: 60,
      specialAttack: 130,
      specialDefense: 95,
      speed: 110,
      moves: [
        moves["Psychic"],
        moves["Swift"],
        moves["Dazzling Gleam"],
        moves["Reflect"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Synchronize"]
    },
    {
      name: "Umbreon",
      pokedexNumber: 197,
      types: ["DARK"],
      hp: 95,
      attack: 65,
      defense: 110,
      specialAttack: 60,
      specialDefense: 130,
      speed: 65,
      moves: [
        moves["Crunch"],
        moves["Bite"],
        moves["Dark Pulse"],
        moves["Shadow Ball"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Synchronize"]
    },
    {
      name: "Wobbuffet",
      pokedexNumber: 202,
      types: ["PSYCHIC"],
      hp: 190,
      attack: 33,
      defense: 58,
      specialAttack: 33,
      specialDefense: 58,
      speed: 33,
      moves: [
        moves["Counter"],
        moves["Mirror Coat"],
        moves["Amnesia"],
        moves["Charm"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Shadow Tag"]
    },
    {
      name: "Forretress",
      pokedexNumber: 205,
      types: ["BUG", "STEEL"],
      hp: 75,
      attack: 90,
      defense: 140,
      specialAttack: 60,
      specialDefense: 60,
      speed: 40,
      moves: [
        moves["Gyro Ball"],
        moves["Rapid Spin"],
        moves["Spikes"],
        moves["Explosion"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Sturdy"]
    },
    {
      name: "Steelix",
      pokedexNumber: 208,
      types: ["STEEL", "GROUND"],
      hp: 75,
      attack: 85,
      defense: 200,
      specialAttack: 55,
      specialDefense: 65,
      speed: 30,
      moves: [
        moves["Iron Head"],
        moves["Earthquake"],
        moves["Gyro Ball"],
        moves["Dragon Tail"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Sturdy"]
    },
    {
      name: "Scizor",
      pokedexNumber: 212,
      types: ["BUG", "STEEL"],
      hp: 70,
      attack: 130,
      defense: 100,
      specialAttack: 55,
      specialDefense: 80,
      speed: 65,
      moves: [
        moves["Bullet Punch"],
        moves["X-Scissor"],
        moves["Swords Dance"],
        moves["Roost"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Technician"]
    },
    {
      name: "Shuckle",
      pokedexNumber: 213,
      types: ["BUG", "ROCK"],
      hp: 40,
      attack: 10,
      defense: 230,
      specialAttack: 10,
      specialDefense: 230,
      speed: 5,
      moves: [
        moves["Toxic"],
        moves["Sticky Web"],
        moves["Stealth Rock"],
        moves["Protect"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Sturdy"]
    },
    {
      name: "Heracross",
      pokedexNumber: 214,
      types: ["BUG", "FIGHTING"],
      hp: 80,
      attack: 125,
      defense: 75,
      specialAttack: 40,
      specialDefense: 95,
      speed: 85,
      moves: [
        moves["Megahorn"],
        moves["Close Combat"],
        moves["Smart Strike"],
        moves["Circle Throw"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Swarm"]
    },
    {
      name: "Skarmory",
      pokedexNumber: 227,
      types: ["STEEL", "FLYING"],
      hp: 75,
      attack: 80,
      defense: 149,
      specialAttack: 40,
      specialDefense: 80,
      speed: 70,
      moves: [
        moves["Steel Wing"],
        moves["Whirlwind"],
        moves["Spikes"],
        moves["Roost"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Sturdy"]
    },
    {
      name: "Donphan",
      pokedexNumber: 232,
      types: ["GROUND"],
      hp: 95,
      attack: 120,
      defense: 125,
      specialAttack: 60,
      specialDefense: 60,
      speed: 50,
      moves: [
        moves["Earthquake"],
        moves["Bulldoze"],
        moves["Rapid Spin"],
        moves["Roar"]
      ],
      size: "medium",
      imgHeight: 5,
      ability: abilities["Sturdy"]
    },
    {
      name: "Shiftry",
      pokedexNumber: 275,
      types: ["GRASS", "DARK"],
      hp: 90,
      attack: 100,
      defense: 60,
      specialAttack: 90,
      specialDefense: 60,
      speed: 80,
      moves: [
        moves["Leaf Blade"],
        moves["Dark Pulse"],
        moves["Brutal Swing"],
        moves["Giga Drain"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Early Bird"]
    },
    {
      name: "Gardevoir",
      pokedexNumber: 282,
      types: ["PSYCHIC", "FAIRY"],
      hp: 68,
      attack: 65,
      defense: 65,
      specialAttack: 125,
      specialDefense: 115,
      speed: 80,
      moves: [
        moves["Moonblast"],
        moves["Will-O-Wisp"],
        moves["Psyshock"],
        moves["Protect"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Synchronize"]
    },
    {
      name: "Mawile",
      pokedexNumber: 303,
      types: ["STEEL", "FAIRY"],
      hp: 70,
      attack: 90,
      defense: 100,
      specialAttack: 72,
      specialDefense: 72,
      speed: 72,
      moves: [
        moves["Play Rough"],
        moves["Iron Head"],
        moves["Ice Fang"],
        moves["Foul Play"]
      ],
      size: "medium",
      imgHeight: 5,
      ability: abilities["Intimidate"]
    },
    {
      name: "Flygon",
      pokedexNumber: 330,
      types: ["GROUND", "DRAGON"],
      hp: 80,
      attack: 100,
      defense: 80,
      specialAttack: 80,
      specialDefense: 80,
      speed: 100,
      moves: [
        moves["Dragon Rush"],
        moves["Earthquake"],
        moves["Bug Buzz"],
        moves["Boomburst"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Levitate"]
    },
    {
      name: "Absol",
      pokedexNumber: 359,
      types: ["DARK"],
      hp: 65,
      attack: 130,
      defense: 60,
      specialAttack: 75,
      specialDefense: 60,
      speed: 75,
      moves: [
        moves["Sucker Punch"],
        moves["Payback"],
        moves["Superpower"],
        moves["Play Rough"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Pressure"]
    },
    {
      name: "Salamence",
      pokedexNumber: 373,
      types: ["DRAGON", "FLYING"],
      hp: 95,
      attack: 135,
      defense: 80,
      specialAttack: 110,
      specialDefense: 80,
      speed: 100,
      moves: [
        moves["Dragon Claw"],
        moves["Dragon Breath"],
        moves["Breaking Swipe"],
        moves["Fire Fang"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Intimidate"]
    },
    {
      name: "Spiritomb",
      pokedexNumber: 442,
      types: ["GHOST", "DARK"],
      hp: 50,
      attack: 92,
      defense: 108,
      specialAttack: 92,
      specialDefense: 108,
      speed: 35,
      moves: [
        moves["Dark Pulse"],
        moves["Shadow Ball"],
        moves["Spite"],
        moves["Nasty Plot"]
      ],
      size: "small",
      imgHeight: 6,
      ability: abilities["Pressure"]
    },
    {
      name: "Lucario",
      pokedexNumber: 448,
      types: ["FIGHTING", "STEEL"],
      hp: 70,
      attack: 110,
      defense: 70,
      specialAttack: 115,
      specialDefense: 70,
      speed: 90,
      moves: [
        moves["Meteor Mash"],
        moves["Close Combat"],
        moves["Focus Blast"],
        moves["Bullet Punch"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Inner Focus"]
    },
    {
      name: "Gliscor",
      pokedexNumber: 472,
      types: ["GROUND", "FLYING"],
      hp: 75,
      attack: 95,
      defense: 125,
      specialAttack: 45,
      specialDefense: 75,
      speed: 95,
      moves: [
        moves["Earthquake"],
        moves["Toxic"],
        moves["Roost"],
        moves["Stealth Rock"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Hyper Cutter"]
    },
    {
      name: "Dusknoir",
      pokedexNumber: 477,
      types: ["GHOST"],
      hp: 45,
      attack: 100,
      defense: 135,
      specialAttack: 65,
      specialDefense: 135,
      speed: 45,
      moves: [
        moves["Shadow Punch"],
        moves["Shadow Sneak"],
        moves["Earthquake"],
        moves["Spite"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Pressure"]
    },
    {
      name: "Victini",
      pokedexNumber: 494,
      types: ["PSYCHIC", "FIRE"],
      hp: 100,
      attack: 100,
      defense: 100,
      specialAttack: 100,
      specialDefense: 100,
      speed: 100,
      moves: [
        moves["V-create"],
        moves["Searing Shot"],
        moves["Zen Headbutt"],
        moves["Thunder Wave"]
      ],
      size: "small",
      imgHeight: 6,
      ability: abilities["Victory Star"]
    },
    {
      name: "Stoutland",
      pokedexNumber: 508,
      types: ["NORMAL"],
      hp: 85,
      attack: 110,
      defense: 90,
      specialAttack: 45,
      specialDefense: 90,
      speed: 80,
      moves: [
        moves["Play Rough"],
        moves["Superpower"],
        moves["Double-Edge"],
        moves["Thunder Fang"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Intimidate"]
    },
    {
      name: "Galvantula",
      pokedexNumber: 596,
      types: ["BUG", "ELECTRIC"],
      hp: 70,
      attack: 77,
      defense: 60,
      specialAttack: 97,
      specialDefense: 60,
      speed: 108,
      moves: [
        moves["Thunder"],
        moves["Leech Life"],
        moves["Electroweb"],
        moves["Sticky Web"]
      ],
      size: "small",
      imgHeight: 5,
      ability: abilities["Compound Eyes"]
    },
    {
      name: "Chandelure",
      pokedexNumber: 609,
      types: ["GHOST", "FIRE"],
      hp: 60,
      attack: 55,
      defense: 90,
      specialAttack: 145,
      specialDefense: 90,
      speed: 80,
      moves: [
        moves["Mystical Fire"],
        moves["Shadow Ball"],
        moves["Overheat"],
        moves["Hex"]
      ],
      size: "small",
      imgHeight: 7,
      ability: abilities["Flash Fire"]
    },
    {
      name: "Granbull",
      pokedexNumber: 210,
      types: ["FAIRY"],
      hp: 90,
      attack: 120,
      defense: 75,
      specialAttack: 60,
      specialDefense: 60,
      speed: 45,
      moves: [
        moves["Play Rough"],
        moves["Close Combat"],
        moves["Earthquake"],
        moves["Roar"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Intimidate"]
    },
    {
      name: "Bisharp",
      pokedexNumber: 625,
      types: ["DARK", "STEEL"],
      hp: 65,
      attack: 125,
      defense: 100,
      specialAttack: 60,
      specialDefense: 70,
      speed: 70,
      moves: [
        moves["Night Slash"],
        moves["Sucker Punch"],
        moves["Iron Head"],
        moves["Swords Dance"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Inner Focus"]
    },
    {
      name: "Hitmontop",
      pokedexNumber: 237,
      types: ["FIGHTING"],
      hp: 50,
      attack: 95,
      defense: 95,
      specialAttack: 35,
      specialDefense: 110,
      speed: 70,
      moves: [
        moves["Close Combat"],
        moves["Low Kick"],
        moves["Rapid Spin"],
        moves["Revenge"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Intimidate"]
    },
    {
      name: "Escavalier",
      pokedexNumber: 589,
      types: ["BUG", "STEEL"],
      hp: 70,
      attack: 135,
      defense: 105,
      specialAttack: 60,
      specialDefense: 105,
      speed: 20,
      moves: [
        moves["X-Scissor"],
        moves["Poison Jab"],
        moves["Smart Strike"],
        moves["Close Combat"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Swarm"]
    },
    {
      name: "Sableye",
      pokedexNumber: 302,
      types: ["DARK", "GHOST"],
      hp: 65,
      attack: 87,
      defense: 87,
      specialAttack: 77,
      specialDefense: 77,
      speed: 65,
      moves: [
        moves["Sucker Punch"],
        moves["Foul Play"],
        moves["Confuse Ray"],
        moves["Recover"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Prankster"]
    },
    {
      name: "Klefki",
      pokedexNumber: 707,
      types: ["STEEL", "FAIRY"],
      hp: 57,
      attack: 80,
      defense: 91,
      specialAttack: 80,
      specialDefense: 87,
      speed: 75,
      moves: [
        moves["Dazzling Gleam"],
        moves["Spikes"],
        moves["Thunder Wave"],
        moves["Toxic"]
      ],
      size: "small",
      imgHeight: 8,
      ability: abilities["Prankster"]
    },
    {
      name: "Whimsicott",
      pokedexNumber: 547,
      types: ["GRASS", "FAIRY"],
      hp: 60,
      attack: 67,
      defense: 85,
      specialAttack: 77,
      specialDefense: 75,
      speed: 116,
      moves: [
        moves["Dazzling Gleam"],
        moves["Charm"],
        moves["Light Screen"],
        moves["Sunny Day"]
      ],
      size: "small",
      imgHeight: 7,
      ability: abilities["Prankster"]
    },
    {
      name: "Ferrothorn",
      pokedexNumber: 598,
      types: ["GRASS", "STEEL"],
      hp: 84,
      attack: 94,
      defense: 141,
      specialAttack: 54,
      specialDefense: 116,
      speed: 20,
      moves: [
        moves["Gyro Ball"],
        moves["Leech Seed"],
        moves["Spikes"],
        moves["Protect"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Iron Barbs"]
    },
    {
      name: "Sharpedo",
      pokedexNumber: 319,
      types: ["WATER", "DARK"],
      hp: 70,
      attack: 120,
      defense: 40,
      specialAttack: 95,
      specialDefense: 40,
      speed: 95,
      moves: [
        moves["Crunch"],
        moves["Bite"],
        moves["Ice Fang"],
        moves["Surf"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Speed Boost"]
    },
    {
      name: "Garchomp",
      pokedexNumber: 445,
      types: ["DRAGON", "GROUND"],
      hp: 108,
      attack: 130,
      defense: 95,
      specialAttack: 80,
      specialDefense: 85,
      speed: 102,
      moves: [
        moves["Dragon Claw"],
        moves["Aqua Tail"],
        moves["Stealth Rock"],
        moves["Swords Dance"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Rough Skin"]
    },
    {
      name: "Heatran",
      pokedexNumber: 485,
      types: ["FIRE", "STEEL"],
      hp: 91,
      attack: 90,
      defense: 106,
      specialAttack: 130,
      specialDefense: 106,
      speed: 77,
      moves: [
        moves["Lava Plume"],
        moves["Magma Storm"],
        moves["Stealth Rock"],
        moves["Protect"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Flame Body"]
    },
    {
      name: "Arceus",
      pokedexNumber: 493,
      types: ["NORMAL"],
      hp: 120,
      attack: 120,
      defense: 120,
      specialAttack: 120,
      specialDefense: 120,
      speed: 120,
      moves: [
        moves["Heat Wave"],
        moves["Thunder"],
        moves["Earthquake"],
        moves["Icy Wind"]
      ],
      ability: abilities["Pressure"],
      size: "large",
      imgHeight: 8
    },
    {
      name: "Claydol",
      pokedexNumber: 344,
      types: ["GROUND", "PSYCHIC"],
      hp: 60,
      attack: 70,
      defense: 105,
      specialAttack: 70,
      specialDefense: 120,
      speed: 75,
      moves: [
        moves["Psychic"],
        moves["Earthquake"],
        moves["Rapid Spin"],
        moves["Toxic"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Levitate"]
    },
    {
      name: "Conkeldurr",
      pokedexNumber: 534,
      types: ["FIGHTING"],
      hp: 105,
      attack: 140,
      defense: 95,
      specialAttack: 55,
      specialDefense: 65,
      speed: 45,
      moves: [
        moves["Drain Punch"],
        moves["Mach Punch"],
        moves["Stone Edge"],
        moves["Fire Punch"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Iron Fist"]
    },
    {
      name: "Reuniclus",
      pokedexNumber: 579,
      types: ["PSYCHIC"],
      hp: 110,
      attack: 65,
      defense: 75,
      specialAttack: 125,
      specialDefense: 85,
      speed: 30,
      moves: [
        moves["Psychic"],
        moves["Psyshock"],
        moves["Calm Mind"],
        moves["Recover"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Magic Guard"]
    },
    {
      name: "Milotic",
      pokedexNumber: 350,
      types: ["WATER"],
      hp: 102,
      attack: 60,
      defense: 89,
      specialAttack: 104,
      specialDefense: 141,
      speed: 87,
      moves: [
        moves["Scald"],
        moves["Ice Beam"],
        moves["Recover"],
        moves["Dragon Tail"]
      ],
      size: "xlarge",
      imgHeight: 7,
      ability: abilities["Marvel Scale"]
    },
    {
      name: "Mienshao",
      pokedexNumber: 620,
      types: ["FIGHTING"],
      hp: 73,
      attack: 125,
      defense: 60,
      specialAttack: 95,
      specialDefense: 60,
      speed: 105,
      moves: [
        moves["Drain Punch"],
        moves["Close Combat"],
        moves["Stone Edge"],
        moves["Brick Break"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Regenerator"]
    },
    {
      name: "Tangrowth",
      pokedexNumber: 465,
      types: ["GRASS"],
      hp: 120,
      attack: 100,
      defense: 125,
      specialAttack: 110,
      specialDefense: 70,
      speed: 50,
      moves: [
        moves["Giga Drain"],
        moves["Sludge Bomb"],
        moves["Leech Seed"],
        moves["Synthesis"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Regenerator"]
    },
    {
      name: "Slaking",
      pokedexNumber: 289,
      types: ["NORMAL"],
      hp: 170,
      attack: 175,
      defense: 110,
      specialAttack: 95,
      specialDefense: 80,
      speed: 110,
      moves: [
        moves["Body Slam"],
        moves["Double-Edge"],
        moves["Earthquake"],
        moves["Rest"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Truant"]
    },
    {
      name: "Cofagrigus",
      pokedexNumber: 563,
      types: ["GHOST"],
      hp: 68,
      attack: 60,
      defense: 157,
      specialAttack: 100,
      specialDefense: 120,
      speed: 30,
      moves: [
        moves["Nasty Plot"],
        moves["Shadow Ball"],
        moves["Toxic Spikes"],
        moves["Rest"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Mummy"]
    },
    {
      name: "Garbodor",
      pokedexNumber: 569,
      types: ["POISON"],
      hp: 90,
      attack: 105,
      defense: 95,
      specialAttack: 63,
      specialDefense: 89,
      speed: 78,
      moves: [
        moves["Gunk Shot"],
        moves["Rock Blast"],
        moves["Toxic Spikes"],
        moves["Explosion"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Weak Armor"]
    },
    {
      name: "Scrafty",
      pokedexNumber: 560,
      types: ["DARK", "FIGHTING"],
      hp: 65,
      attack: 90,
      defense: 115,
      specialAttack: 45,
      specialDefense: 115,
      speed: 58,
      moves: [
        moves["Payback"],
        moves["Revenge"],
        moves["Close Combat"],
        moves["Rest"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Shed Skin"]
    },
    {
      name: "Druddigon",
      pokedexNumber: 621,
      types: ["DRAGON"],
      hp: 77,
      attack: 120,
      defense: 90,
      specialAttack: 60,
      specialDefense: 90,
      speed: 48,
      moves: [
        moves["Dragon Claw"],
        moves["Dragon Tail"],
        moves["Superpower"],
        moves["Glare"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Rough Skin"]
    },
    {
      name: "Luxray",
      pokedexNumber: 405,
      types: ["ELECTRIC"],
      hp: 90,
      attack: 124,
      defense: 89,
      specialAttack: 100,
      specialDefense: 95,
      speed: 80,
      moves: [
        moves["Thunder Fang"],
        moves["Thunder"],
        moves["Crunch"],
        moves["Fire Fang"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Guts"]
    },
    {
      name: "Lugia",
      pokedexNumber: 249,
      types: ["PSYCHIC", "FLYING"],
      hp: 106,
      attack: 90,
      defense: 130,
      specialAttack: 90,
      specialDefense: 154,
      speed: 110,
      moves: [
        moves["Ice Beam"],
        moves["Dragon Tail"],
        moves["Toxic"],
        moves["Roost"]
      ],
      size: "xlarge",
      imgHeight: 9,
      ability: abilities["Multiscale"]
    },
    {
      name: "Ho-oh",
      spriteName: "hooh",
      pokedexNumber: 250,
      types: ["FIRE", "FLYING"],
      hp: 106,
      attack: 130,
      defense: 90,
      specialAttack: 110,
      specialDefense: 154,
      speed: 90,
      moves: [
        moves["Sacred Fire"],
        moves["Flame Charge"],
        moves["Whirlwind"],
        moves["Roost"]
      ],
      size: "large",
      imgHeight: 9,
      ability: abilities["Regenerator"]
    },
    {
      name: "Raikou",
      pokedexNumber: 243,
      types: ["ELECTRIC"],
      hp: 90,
      attack: 85,
      defense: 75,
      specialAttack: 115,
      specialDefense: 100,
      speed: 115,
      moves: [
        moves["Thunderbolt"],
        moves["Thunder Fang"],
        moves["Bite"],
        moves["Extreme Speed"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Pressure"]
    },
    {
      name: "Entei",
      pokedexNumber: 244,
      types: ["FIRE"],
      hp: 115,
      attack: 115,
      defense: 85,
      specialAttack: 90,
      specialDefense: 75,
      speed: 100,
      moves: [
        moves["Sacred Fire"],
        moves["Flare Blitz"],
        moves["Stone Edge"],
        moves["Extreme Speed"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Pressure"]
    },
    {
      name: "Suicune",
      pokedexNumber: 245,
      types: ["WATER"],
      hp: 100,
      attack: 75,
      defense: 115,
      specialAttack: 90,
      specialDefense: 115,
      speed: 85,
      moves: [
        moves["Surf"],
        moves["Ice Beam"],
        moves["Calm Mind"],
        moves["Extreme Speed"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Celebi",
      pokedexNumber: 251,
      types: ["PSYCHIC", "GRASS"],
      hp: 100,
      attack: 100,
      defense: 100,
      specialAttack: 100,
      specialDefense: 100,
      speed: 100,
      moves: [
        moves["Leaf Storm"],
        moves["Grass Knot"],
        moves["Psychic"],
        moves["Recover"]
      ],
      size: "small",
      imgHeight: 7,
      ability: abilities["Natural Cure"]
    },
    {
      name: "Deoxys",
      pokedexNumber: 386,
      types: ["PSYCHIC"],
      hp: 50,
      attack: 150,
      defense: 50,
      specialAttack: 150,
      specialDefense: 50,
      speed: 150,
      moves: [
        moves["Psycho Boost"],
        moves["Superpower"],
        moves["Light Screen"],
        moves["Reflect"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Torterra",
      pokedexNumber: 389,
      types: ["GRASS", "GROUND"],
      hp: 95,
      attack: 109,
      defense: 105,
      specialAttack: 75,
      specialDefense: 85,
      speed: 56,
      moves: [
        moves["Earthquake"],
        moves["Stone Edge"],
        moves["Wood Hammer"],
        moves["Synthesis"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Overgrow"]
    },
    {
      name: "Infernape",
      pokedexNumber: 392,
      types: ["FIRE", "FIGHTING"],
      hp: 76,
      attack: 104,
      defense: 71,
      specialAttack: 104,
      specialDefense: 71,
      speed: 108,
      moves: [
        moves["Fire Punch"],
        moves["Drain Punch"],
        moves["Thunder Punch"],
        moves["Overheat"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Iron Fist"]
    },
    {
      name: "Rapidash",
      pokedexNumber: 78,
      types: ["FIRE"],
      hp: 75,
      attack: 105,
      defense: 72,
      specialAttack: 85,
      specialDefense: 80,
      speed: 109,
      moves: [
        moves["Flame Charge"],
        moves["Fire Spin"],
        moves["Smart Strike"],
        moves["Horn Drill"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Flame Body"]
    },
    {
      name: "Bronzong",
      pokedexNumber: 437,
      types: ["STEEL", "PSYCHIC"],
      hp: 67,
      attack: 89,
      defense: 116,
      specialAttack: 79,
      specialDefense: 116,
      speed: 33,
      moves: [
        moves["Gyro Ball"],
        moves["Stealth Rock"],
        moves["Toxic"],
        moves["Reflect"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Levitate"]
    },
    {
      name: "Breloom",
      pokedexNumber: 286,
      types: ["GRASS", "FIGHTING"],
      hp: 60,
      attack: 130,
      defense: 80,
      specialAttack: 60,
      specialDefense: 60,
      speed: 70,
      moves: [
        moves["Bullet Seed"],
        moves["Mach Punch"],
        moves["Drain Punch"],
        moves["Swords Dance"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Technician"]
    },
    {
      name: "Shedinja",
      pokedexNumber: 292,
      types: ["BUG", "GHOST"],
      hp: 1,
      attack: 90,
      defense: 45,
      specialAttack: 30,
      specialDefense: 30,
      speed: 40,
      moves: [
        moves["Shadow Claw"],
        moves["Shadow Sneak"],
        moves["X-Scissor"],
        moves["Protect"]
      ],
      size: "small",
      imgHeight: 6,
      ability: abilities["Wonder Guard"]
    },
    {
      name: "Toxicroak",
      pokedexNumber: 454,
      types: ["POISON", "FIGHTING"],
      hp: 89,
      attack: 112,
      defense: 72,
      specialAttack: 85,
      specialDefense: 72,
      speed: 95,
      moves: [
        moves["Sucker Punch"],
        moves["Drain Punch"],
        moves["Gunk Shot"],
        moves["Toxic Spikes"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Poison Touch"]
    },
    {
      name: "Hydreigon",
      pokedexNumber: 635,
      types: ["DARK", "DRAGON"],
      hp: 92,
      attack: 105,
      defense: 90,
      specialAttack: 125,
      specialDefense: 90,
      speed: 98,
      moves: [
        moves["Dark Pulse"],
        moves["Draco Meteor"],
        moves["Flamethrower"],
        moves["Roost"]
      ],
      size: "large",
      imgHeight: 10,
      ability: abilities["Levitate"]
    },
    {
      name: "Exploud",
      pokedexNumber: 295,
      types: ["NORMAL"],
      hp: 124,
      attack: 99,
      defense: 73,
      specialAttack: 99,
      specialDefense: 82,
      speed: 78,
      moves: [
        moves["Boomburst"],
        moves["Earthquake"],
        moves["Overheat"],
        moves["Low Kick"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Soundproof"]
    },
    {
      name: "Haxorus",
      pokedexNumber: 612,
      types: ["DRAGON"],
      hp: 76,
      attack: 147,
      defense: 90,
      specialAttack: 60,
      specialDefense: 70,
      speed: 97,
      moves: [
        moves["Dragon Claw"],
        moves["Earthquake"],
        moves["Poison Jab"],
        moves["Dragon Dance"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Inner Focus"]
    },
    {
      name: "Weavile",
      pokedexNumber: 461,
      types: ["DARK", "ICE"],
      hp: 70,
      attack: 120,
      defense: 65,
      specialAttack: 45,
      specialDefense: 85,
      speed: 125,
      moves: [
        moves["Night Slash"],
        moves["Ice Shard"],
        moves["Ice Punch"],
        moves["Poison Jab"]
      ],
      size: "small",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Cresselia",
      pokedexNumber: 488,
      types: ["PSYCHIC"],
      hp: 120,
      attack: 70,
      defense: 120,
      specialAttack: 75,
      specialDefense: 130,
      speed: 85,
      moves: [
        moves["Psychic"],
        moves["Thunder Wave"],
        moves["Light Screen"],
        moves["Reflect"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Levitate"]
    },
    {
      name: "Darmanitan",
      pokedexNumber: 555,
      types: ["FIRE"],
      hp: 105,
      attack: 140,
      defense: 55,
      specialAttack: 30,
      specialDefense: 55,
      speed: 95,
      moves: [
        moves["Flare Blitz"],
        moves["Rock Slide"],
        moves["Fire Punch"],
        moves["Superpower"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Sheer Force"]
    },
    {
      name: "Aegislash",
      altSpriteName: "aegislash-blade",
      pokedexNumber: 681,
      types: ["STEEL", "GHOST"],
      hp: 79,
      attack: 50,
      defense: 140,
      specialAttack: 50,
      specialDefense: 140,
      speed: 60,
      moves: [
        moves["Sacred Sword"],
        moves[`King's Shield`],
        moves["Shadow Sneak"],
        moves["Toxic"]
      ],
      size: "medium",
      imgHeight: 9,
      ability: abilities["Stance Change"]
    },
    {
      name: "Serperior",
      pokedexNumber: 497,
      types: ["GRASS"],
      hp: 82,
      attack: 77,
      defense: 99,
      specialAttack: 77,
      specialDefense: 99,
      speed: 113,
      moves: [
        moves["Giga Drain"],
        moves["Leaf Storm"],
        moves["Glare"],
        moves["Calm Mind"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Overgrow"]
    },
    {
      name: "Feraligatr",
      pokedexNumber: 160,
      types: ["WATER"],
      hp: 87,
      attack: 110,
      defense: 105,
      specialAttack: 79,
      specialDefense: 85,
      speed: 79,
      moves: [
        moves["Waterfall"],
        moves["Ice Punch"],
        moves["Crunch"],
        moves["Dragon Dance"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Sheer Force"]
    },
    {
      name: "Blissey",
      pokedexNumber: 242,
      types: ["NORMAL"],
      hp: 275,
      attack: 20,
      defense: 55,
      specialAttack: 79,
      specialDefense: 142,
      speed: 58,
      moves: [
        moves["Seismic Toss"],
        moves["Toxic"],
        moves["Soft-Boiled"],
        moves["Protect"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Natural Cure"]
    },
    {
      name: "Slowking",
      pokedexNumber: 199,
      types: ["WATER", "PSYCHIC"],
      hp: 105,
      attack: 75,
      defense: 80,
      specialAttack: 105,
      specialDefense: 125,
      speed: 30,
      moves: [
        moves["Scald"],
        moves["Psyshock"],
        moves["Toxic"],
        moves["Calm Mind"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Regenerator"]
    },
    {
      name: "Poliwrath",
      pokedexNumber: 62,
      types: ["WATER", "FIGHTING"],
      hp: 90,
      attack: 95,
      defense: 95,
      specialAttack: 70,
      specialDefense: 90,
      speed: 70,
      moves: [
        moves["Waterfall"],
        moves["Drain Punch"],
        moves["Brick Break"],
        moves["Circle Throw"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Swift Swim"]
    },
    {
      name: "Seismitoad",
      pokedexNumber: 537,
      types: ["WATER", "GROUND"],
      hp: 105,
      attack: 95,
      defense: 75,
      specialAttack: 85,
      specialDefense: 75,
      speed: 74,
      moves: [
        moves["Earthquake"],
        moves["Scald"],
        moves["Toxic"],
        moves["Drain Punch"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Swift Swim"]
    },
    {
      name: "Tentacruel",
      pokedexNumber: 73,
      types: ["WATER", "POISON"],
      hp: 80,
      attack: 73,
      defense: 78,
      specialAttack: 83,
      specialDefense: 129,
      speed: 101,
      moves: [
        moves["Scald"],
        moves["Waterfall"],
        moves["Sludge Bomb"],
        moves["Toxic Spikes"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Rain Dish"]
    },
    {
      name: "Froslass",
      pokedexNumber: 478,
      types: ["ICE", "GHOST"],
      hp: 77,
      attack: 89,
      defense: 77,
      specialAttack: 89,
      specialDefense: 77,
      speed: 116,
      moves: [
        moves["Blizzard"],
        moves["Shadow Ball"],
        moves["Icy Wind"],
        moves["Spikes"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Snow Cloak"]
    },
    {
      name: "Glaceon",
      pokedexNumber: 471,
      types: ["ICE"],
      hp: 66,
      attack: 60,
      defense: 110,
      specialAttack: 130,
      specialDefense: 97,
      speed: 66,
      moves: [
        moves["Ice Beam"],
        moves["Blizzard"],
        moves["Shadow Ball"],
        moves["Water Pulse"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Ice Body"]
    },
    {
      name: "Dewgong",
      pokedexNumber: 87,
      types: ["WATER", "ICE"],
      hp: 99,
      attack: 72,
      defense: 80,
      specialAttack: 70,
      specialDefense: 95,
      speed: 70,
      moves: [
        moves["Ice Beam"],
        moves["Water Pulse"],
        moves["Icy Wind"],
        moves["Aqua Tail"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Ice Body"]
    },
    {
      name: "Mamoswine",
      pokedexNumber: 473,
      types: ["ICE", "GROUND"],
      hp: 114,
      attack: 130,
      defense: 87,
      specialAttack: 70,
      specialDefense: 67,
      speed: 80,
      moves: [
        moves["Icicle Crash"],
        moves["Earthquake"],
        moves["Ice Shard"],
        moves["Protect"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Snow Cloak"]
    },
    {
      name: "Groudon",
      pokedexNumber: 383,
      types: ["GROUND"],
      hp: 100,
      attack: 150,
      defense: 140,
      specialAttack: 100,
      specialDefense: 90,
      speed: 90,
      moves: [
        moves["Earthquake"],
        moves["Hammer Arm"],
        moves["Overheat"],
        moves["Dragon Tail"]
      ],
      size: "xlarge",
      imgHeight: 7,
      ability: abilities["Drought"]
    },
    {
      name: "Kyogre",
      pokedexNumber: 382,
      types: ["WATER"],
      hp: 100,
      attack: 100,
      defense: 90,
      specialAttack: 150,
      specialDefense: 140,
      speed: 90,
      moves: [
        moves["Water Spout"],
        moves["Thunder"],
        moves["Ice Beam"],
        moves["Water Pulse"]
      ],
      size: "xlarge",
      imgHeight: 7,
      ability: abilities["Drizzle"]
    },
    {
      name: "Pelipper",
      pokedexNumber: 279,
      types: ["WATER", "FLYING"],
      hp: 67,
      attack: 50,
      defense: 102,
      specialAttack: 95,
      specialDefense: 77,
      speed: 65,
      moves: [
        moves["Hydro Pump"],
        moves["Water Pulse"],
        moves["Hurricane"],
        moves["Roost"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Drizzle"]
    },
    {
      name: "Ludicolo",
      pokedexNumber: 272,
      types: ["WATER", "GRASS"],
      hp: 92,
      attack: 70,
      defense: 77,
      specialAttack: 93,
      specialDefense: 107,
      speed: 70,
      moves: [
        moves["Giga Drain"],
        moves["Hydro Pump"],
        moves["Leech Seed"],
        moves["Rain Dance"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Rain Dish"]
    },
    {
      name: "Excadrill",
      pokedexNumber: 530,
      types: ["GROUND", "STEEL"],
      hp: 110,
      attack: 135,
      defense: 60,
      specialAttack: 50,
      specialDefense: 65,
      speed: 88,
      moves: [
        moves["Earthquake"],
        moves["Iron Head"],
        moves["Rapid Spin"],
        moves["Swords Dance"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Sand Rush"]
    },
    {
      name: "Leafeon",
      pokedexNumber: 470,
      types: ["GRASS"],
      hp: 68,
      attack: 110,
      defense: 130,
      specialAttack: 60,
      specialDefense: 65,
      speed: 95,
      moves: [
        moves["Leaf Blade"],
        moves["X-Scissor"],
        moves["Synthesis"],
        moves["Sunny Day"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Chlorophyll"]
    },
    {
      name: "Porygon-Z",
      spriteName: "porygonz",
      pokedexNumber: 474,
      types: ["PSYCHIC"],
      hp: 95,
      attack: 93,
      defense: 78,
      specialAttack: 135,
      specialDefense: 77,
      speed: 92,
      moves: [
        moves["Psychic"],
        moves["Tri Attack"],
        moves["Dark Pulse"],
        moves["Conversion 2"]
      ],
      size: "small",
      imgHeight: 7,
      ability: abilities["Download"]
    },
    {
      name: "Genesect",
      pokedexNumber: 649,
      types: ["BUG", "STEEL"],
      hp: 71,
      attack: 120,
      defense: 95,
      specialAttack: 120,
      specialDefense: 95,
      speed: 99,
      moves: [
        moves["X-Scissor"],
        moves["Flamethrower"],
        moves["Ice Beam"],
        moves["Explosion"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Download"]
    },
    {
      name: "Metagross",
      pokedexNumber: 376,
      types: ["STEEL", "PSYCHIC"],
      hp: 89,
      attack: 135,
      defense: 139,
      specialAttack: 95,
      specialDefense: 99,
      speed: 70,
      moves: [
        moves["Zen Headbutt"],
        moves["Bullet Punch"],
        moves["Flash Cannon"],
        moves["Stealth Rock"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Clear Body"]
    },
    {
      name: "Abomasnow",
      pokedexNumber: 460,
      types: ["GRASS", "ICE"],
      hp: 99,
      attack: 92,
      defense: 75,
      specialAttack: 92,
      specialDefense: 85,
      speed: 60,
      moves: [
        moves["Giga Drain"],
        moves["Blizzard"],
        moves["Ice Shard"],
        moves["Leech Seed"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Snow Warning"]
    },
    {
      name: "Darkrai",
      pokedexNumber: 491,
      types: ["DARK"],
      hp: 70,
      attack: 90,
      defense: 90,
      specialAttack: 135,
      specialDefense: 90,
      speed: 125,
      moves: [
        moves["Dark Void"],
        moves["Dream Eater"],
        moves["Nasty Plot"],
        moves["Confuse Ray"]
      ],
      size: "large",
      imgHeight: 9,
      ability: abilities["Bad Dreams"]
    },
    {
      name: "Sandslash",
      pokedexNumber: 28,
      types: ["GROUND"],
      hp: 75,
      attack: 108,
      defense: 114,
      specialAttack: 45,
      specialDefense: 60,
      speed: 68,
      moves: [
        moves["Earthquake"],
        moves["Sandstorm"],
        moves["Night Slash"],
        moves["Flail"]
      ],
      size: "medium",
      imgHeight: 6,
      ability: abilities["Sand Rush"]
    },
    {
      name: "Tornadus",
      pokedexNumber: 641,
      types: ["FLYING"],
      hp: 79,
      attack: 115,
      defense: 70,
      specialAttack: 125,
      specialDefense: 80,
      speed: 111,
      moves: [
        moves["Hurricane"],
        moves["Air Slash"],
        moves["Rest"],
        moves["Thunder Wave"]
      ],
      size: "large",
      imgHeight: 9,
      ability: abilities["Prankster"]
    },
    {
      name: "Thundurus",
      pokedexNumber: 642,
      types: ["ELECTRIC", "FLYING"],
      hp: 79,
      attack: 115,
      defense: 70,
      specialAttack: 125,
      specialDefense: 80,
      speed: 111,
      moves: [
        moves["Thunder"],
        moves["Superpower"],
        moves["Rain Dance"],
        moves["Thunder Wave"]
      ],
      size: "large",
      imgHeight: 9,
      ability: abilities["Prankster"]
    },
    {
      name: "Landorus",
      pokedexNumber: 645,
      types: ["GROUND", "FLYING"],
      hp: 89,
      attack: 125,
      defense: 90,
      specialAttack: 115,
      specialDefense: 80,
      speed: 101,
      moves: [
        moves["Earthquake"],
        moves["Stone Edge"],
        moves["Grass Knot"],
        moves["Sandstorm"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Sand Force"]
    },
    {
      name: "Tyranitar",
      pokedexNumber: 248,
      types: ["ROCK", "DARK"],
      hp: 100,
      attack: 134,
      defense: 110,
      specialAttack: 95,
      specialDefense: 100,
      speed: 61,
      moves: [
        moves["Crunch"],
        moves["Stone Edge"],
        moves["Dark Pulse"],
        moves["Stealth Rock"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Sand Stream"]
    },
    {
      name: "Gigalith",
      pokedexNumber: 526,
      types: ["ROCK"],
      hp: 95,
      attack: 134,
      defense: 140,
      specialAttack: 60,
      specialDefense: 90,
      speed: 25,
      moves: [
        moves["Rock Blast"],
        moves["Iron Head"],
        moves["Explosion"],
        moves["Sandstorm"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Sturdy"]
    },
    {
      name: "Hippowdon",
      pokedexNumber: 450,
      types: ["GROUND"],
      hp: 118,
      attack: 112,
      defense: 130,
      specialAttack: 68,
      specialDefense: 72,
      speed: 47,
      moves: [
        moves["Earthquake"],
        moves["Bite"],
        moves["Stealth Rock"],
        moves["Whirlwind"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Sand Stream"]
    },
    {
      name: "Vanilluxe",
      pokedexNumber: 584,
      types: ["ICE"],
      hp: 78,
      attack: 95,
      defense: 89,
      specialAttack: 115,
      specialDefense: 106,
      speed: 79,
      moves: [
        moves["Blizzard"],
        moves["Icy Wind"],
        moves["Ice Shard"],
        moves["Flash Cannon"]
      ],
      size: "small",
      imgHeight: 7,
      ability: abilities["Snow Warning"]
    },
    {
      name: "Dialga",
      pokedexNumber: 483,
      types: ["STEEL", "DRAGON"],
      hp: 100,
      attack: 120,
      defense: 120,
      specialAttack: 150,
      specialDefense: 100,
      speed: 90,
      moves: [
        moves["Dragon Pulse"],
        moves["Thunder"],
        moves["Draco Meteor"],
        moves["Roar"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Palkia",
      pokedexNumber: 484,
      types: ["WATER", "DRAGON"],
      hp: 90,
      attack: 120,
      defense: 100,
      specialAttack: 150,
      specialDefense: 120,
      speed: 100,
      moves: [
        moves["Dragon Pulse"],
        moves["Hydro Pump"],
        moves["Dragon Claw"],
        moves["Water Pulse"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Torkoal",
      pokedexNumber: 323,
      types: ["FIRE"],
      hp: 70,
      attack: 85,
      defense: 140,
      specialAttack: 85,
      specialDefense: 70,
      speed: 20,
      moves: [
        moves["Eruption"],
        moves["Lava Plume"],
        moves["Sludge Bomb"],
        moves["Explosion"]
      ],
      size: "medium",
      imgHeight: 7,
      ability: abilities["Drought"]
    },
    {
      name: "Giratina",
      pokedexNumber: 489,
      types: ["GHOST", "DRAGON"],
      hp: 150,
      attack: 100,
      defense: 120,
      specialAttack: 100,
      specialDefense: 120,
      speed: 90,
      moves: [
        moves["Draco Meteor"],
        moves["Shadow Claw"],
        moves["Dark Pulse"],
        moves["Will-O-Wisp"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Regirock",
      pokedexNumber: 377,
      types: ["ROCK"],
      hp: 90,
      attack: 100,
      defense: 200,
      specialAttack: 50,
      specialDefense: 100,
      speed: 50,
      moves: [
        moves["Stone Edge"],
        moves["Hammer Arm"],
        moves["Earthquake"],
        moves["Explosion"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Sturdy"]
    },
    {
      name: "Regice",
      pokedexNumber: 378,
      types: ["ICE"],
      hp: 90,
      attack: 50,
      defense: 100,
      specialAttack: 100,
      specialDefense: 200,
      speed: 50,
      moves: [
        moves["Blizzard"],
        moves["Ice Beam"],
        moves["Focus Blast"],
        moves["Hail"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Clear Body"]
    },
    {
      name: "Registeel",
      pokedexNumber: 379,
      types: ["STEEL"],
      hp: 90,
      attack: 75,
      defense: 150,
      specialAttack: 75,
      specialDefense: 150,
      speed: 50,
      moves: [
        moves["Flash Cannon"],
        moves["Iron Head"],
        moves["Thunderbolt"],
        moves["Explosion"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Clear Body"]
    },
    {
      name: "Togekiss",
      pokedexNumber: 468,
      types: ["FAIRY", "FLYING"],
      hp: 85,
      attack: 50,
      defense: 95,
      specialAttack: 120,
      specialDefense: 115,
      speed: 80,
      moves: [
        moves["Air Slash"],
        moves["Roost"],
        moves["Nasty Plot"],
        moves["Thunder Wave"]
      ],
      size: "large",
      imgHeight: 6,
      ability: abilities["Serene Grace"]
    },
    {
      name: "Rotom",
      pokedexNumber: 479,
      types: ["ELECTRIC", "GHOST"],
      hp: 64,
      attack: 50,
      defense: 87,
      specialAttack: 99,
      specialDefense: 87,
      speed: 97,
      moves: [
        moves["Shadow Ball"],
        moves["Discharge"],
        moves["Confuse Ray"],
        moves["Light Screen"]
      ],
      size: "small",
      imgHeight: 7,
      ability: abilities["Levitate"]
    },
    {
      name: "Jirachi",
      pokedexNumber: 385,
      types: ["STEEL", "PSYCHIC"],
      hp: 100,
      attack: 100,
      defense: 100,
      specialAttack: 100,
      specialDefense: 100,
      speed: 100,
      moves: [
        moves["Psyshock"],
        moves["Iron Head"],
        moves["Thunder"],
        moves["Water Pulse"]
      ],
      size: "small",
      imgHeight: 6,
      ability: abilities["Serene Grace"]
    },
    {
      name: "Probopass",
      pokedexNumber: 476,
      types: ["ROCK", "STEEL"],
      hp: 78,
      attack: 55,
      defense: 145,
      specialAttack: 75,
      specialDefense: 150,
      speed: 40,
      moves: [
        moves["Power Gem"],
        moves["Flash Cannon"],
        moves["Stealth Rock"],
        moves["Toxic"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Sturdy"]
    },
    {
      name: "Meloetta",
      pokedexNumber: 648,
      types: ["NORMAL", "PSYCHIC"],
      hp: 100,
      attack: 77,
      defense: 77,
      specialAttack: 128,
      specialDefense: 128,
      speed: 90,
      moves: [
        moves["Psychic"],
        moves["Hyper Voice"],
        moves["Thunderbolt"],
        moves["Shadow Ball"]
      ],
      size: "small",
      imgHeight: 7,
      ability: abilities["Serene Grace"]
    },
    {
      name: "Shaymin",
      spriteName: "shaymin-sky",
      pokedexNumber: 492,
      types: ["GRASS", "FLYING"],
      hp: 100,
      attack: 103,
      defense: 75,
      specialAttack: 120,
      specialDefense: 75,
      speed: 127,
      moves: [
        moves["Energy Ball"],
        moves["Air Slash"],
        moves["Earth Power"],
        moves["Leech Seed"]
      ],
      size: "medium",
      imgHeight: 8,
      ability: abilities["Serene Grace"]
    },
    {
      name: "Miltank",
      pokedexNumber: 241,
      types: ["NORMAL"],
      hp: 100,
      attack: 83,
      defense: 109,
      specialAttack: 40,
      specialDefense: 70,
      speed: 100,
      moves: [
        moves["Body Slam"],
        moves["Hammer Arm"],
        moves["Toxic"],
        moves["Recover"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Thick Fat"]
    },
    {
      name: "Hariyama",
      pokedexNumber: 297,
      types: ["FIGHTING"],
      hp: 147,
      attack: 120,
      defense: 65,
      specialAttack: 40,
      specialDefense: 65,
      speed: 55,
      moves: [
        moves["Close Combat"],
        moves["Stone Edge"],
        moves["Bullet Punch"],
        moves["Whirlwind"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Thick Fat"]
    },
    {
      name: "Sceptile",
      pokedexNumber: 254,
      types: ["GRASS"],
      hp: 72,
      attack: 87,
      defense: 69,
      specialAttack: 105,
      specialDefense: 85,
      speed: 120,
      moves: [
        moves["Energy Ball"],
        moves["Giga Drain"],
        moves["Leaf Storm"],
        moves["X-Scissor"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Overgrow"]
    },
    {
      name: "Blaziken",
      pokedexNumber: 257,
      types: ["FIRE", "FIGHTING"],
      hp: 80,
      attack: 123,
      defense: 70,
      specialAttack: 113,
      specialDefense: 70,
      speed: 83,
      moves: [
        moves["Flare Blitz"],
        moves["Flamethrower"],
        moves["Low Kick"],
        moves["Protect"]
      ],
      size: "large",
      imgHeight: 7,
      ability: abilities["Speed Boost"]
    },
    {
      name: "Reshiram",
      pokedexNumber: 643,
      types: ["DRAGON", "FIRE"],
      hp: 100,
      attack: 120,
      defense: 100,
      specialAttack: 150,
      specialDefense: 120,
      speed: 90,
      moves: [
        moves["Mystical Fire"],
        moves["Dragon Pulse"],
        moves["Fire Blast"],
        moves["Dragon Breath"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Zekrom",
      pokedexNumber: 644,
      types: ["DRAGON", "ELECTRIC"],
      hp: 100,
      attack: 150,
      defense: 120,
      specialAttack: 120,
      specialDefense: 100,
      speed: 90,
      moves: [
        moves["Dragon Claw"],
        moves["Scale Shot"],
        moves["Bolt Strike"],
        moves["Thunder Punch"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Kyurem",
      pokedexNumber: 646,
      types: ["DRAGON", "ICE"],
      hp: 125,
      attack: 130,
      defense: 90,
      specialAttack: 130,
      specialDefense: 90,
      speed: 95,
      moves: [
        moves["Dragon Pulse"],
        moves["Ice Beam"],
        moves["Icicle Spear"],
        moves["Dual Wingbeat"]
      ],
      size: "xlarge",
      imgHeight: 8,
      ability: abilities["Pressure"]
    },
    {
      name: "Eelektross",
      pokedexNumber: 604,
      types: ["ELECTRIC"],
      hp: 85,
      attack: 115,
      defense: 82,
      specialAttack: 111,
      specialDefense: 80,
      speed: 56,
      moves: [
        moves["Thunderbolt"],
        moves["Dragon Claw"],
        moves["Aqua Tail"],
        moves["Thunder Wave"]
      ],
      size: "large",
      imgHeight: 8,
      ability: abilities["Levitate"]
    },
    {
      name: "Sylveon",
      pokedexNumber: 700,
      types: ["FAIRY"],
      hp: 99,
      attack: 75,
      defense: 75,
      specialAttack: 115,
      specialDefense: 130,
      speed: 70,
      moves: [
        moves["Hyper Voice"],
        moves["Mystical Fire"],
        moves["Charm"],
        moves["Quick Attack"]
      ],
      size: "medium",
      imgHeight: 9,
      ability: abilities["Pixilate"]
    },
    {
      name: "Rayquaza",
      pokedexNumber: 384,
      types: ["DRAGON", "FLYING"],
      hp: 105,
      attack: 150,
      defense: 90,
      specialAttack: 150,
      specialDefense: 90,
      speed: 95,
      moves: [
        moves["Draco Meteor"],
        moves["Dragon Claw"],
        moves["V-create"],
        moves["Extreme Speed"]
      ],
      size: "xlarge",
      imgHeight: 10,
      ability: abilities["Air Lock"]
    }
  ];
  function getUnlockedSpecies(unlockedNumbers, isAdmin = false) {
    if (isAdmin) {
      return [...speciesList];
    } else {
      return speciesList.filter((s) => unlockedNumbers.includes(s.pokedexNumber));
    }
  }

  // src/model/search.ts
  function createSpeciesListIndex(speciesList2) {
    const startTime = performance.now();
    const index = {};
    speciesList2.forEach((species) => {
      const tokens = generateTokensForSpecies(species);
      tokens.forEach((token) => {
        if (!index[token]) {
          index[token] = [species];
        } else if (!index[token].includes(species)) {
          index[token].push(species);
        }
      });
    });
    const endTime = performance.now();
    logDebug(`Indexed ${Object.keys(index).length} tokens in ${endTime - startTime} milliseconds`);
    return index;
  }
  function generateTokensForSpecies(p) {
    const tokens = [];
    tokens.push(...generateTypeAheadTokens(p.name));
    p.types.forEach((type) => tokens.push(...generateTypeAheadTokens(type)));
    p.moves.forEach((move) => {
      tokens.push(...generateTypeAheadTokens(move.name));
      tokens.push(...generateTypeAheadTokens(move.type));
    });
    if (p.ability) {
      tokens.push(...generateTypeAheadTokens(p.ability.name));
    }
    return normalizeTokens(tokens);
  }
  function generateTypeAheadTokens(val) {
    const tokens = [];
    if (val.length > 0) {
      for (let i = 1; i < val.length; i++) {
        const sub = val.substring(0, i + 1);
        tokens.push(sub);
      }
    }
    return tokens;
  }
  function normalizeTokens(tokens) {
    return tokens.map(normalizeToken);
  }
  function normalizeToken(token) {
    return token.toLowerCase().replace(" ", "").replace(".", "").replace("'", "").replace("\u2640", "").replace("\u2642", "");
  }

  // src/util/random.ts
  var Random = class {
    constructor(rng) {
      if (rng) {
        this.rng = rng;
      } else {
        this.rng = Math.random;
      }
    }
    coinFlip() {
      return this.rng() < 0.5;
    }
    randomPick(options) {
      return options[Math.floor(this.rng() * options.length)];
    }
    weightedRandomPick(options, chances) {
      if (options.length !== chances.length) {
        throw new Error("Each option should have a chance number");
      }
      let sum = chances.reduce((prev, current) => prev + current, 0);
      if (sum < 0.9) {
        logInfo("WARNING: Chance numbers should add up to 1 or nearly 1. Instead the sum is: " + sum);
      }
      let random2 = this.rng();
      let totalChances = 0;
      for (let i = 0; i < options.length; i++) {
        totalChances += chances[i];
        if (random2 <= totalChances) {
          return options[i];
        }
      }
      throw new Error("Something went wrong during weighted random pick");
    }
    randomFloatInRange(start, end) {
      return this.rng() * (end - start) + start;
    }
    randomIntegerInRange(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max) + 1;
      return Math.floor(this.rng() * (max - min) + min);
    }
    roll(percentage) {
      return this.rng() < percentage;
    }
    generateId() {
      return Math.floor(1e3 + this.rng() * 9e3) + "";
    }
    shuffle(array) {
      let currentIndex = array.length, randomIndex;
      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex]
        ];
      }
      return array;
    }
  };

  // src/model/team-autopick.ts
  var random = new Random();
  function automaticallyPickTeam(teamSize, unlocked) {
    const team = [];
    for (let i = 0; i < teamSize; i++) {
      pick(team, unlocked);
    }
    return team.map((species) => species.name);
  }
  function pick(team, unlocked) {
    let pick2;
    let attempts = 0;
    while (alreadyPicked(pick2, team)) {
      if (attempts > 1e3) {
        throw new Error("Unable to find pick");
      }
      pick2 = random.randomPick(unlocked);
      attempts++;
    }
    if (pick2) {
      team.push(pick2);
    }
  }
  function alreadyPicked(pick2, team) {
    if (!pick2) {
      return true;
    }
    const length = team.filter((e) => e.name === pick2.name).length;
    return length > 0;
  }

  // src/client/icons-component.ts
  var BackArrowComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div @click="handleClick" class="ml-5 cursor-pointer">
      <i class="fa fa-angle-left fa-2x"></i>
    </div>
  `;
    }
    handleClick() {
      if (this.props.action) {
        this.props.action();
      }
    }
  };
  var DoubleBackArrowComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div @click="handleClick" class="ml-5 cursor-pointer">
      <i class="fa fa-angle-double-left fa-2x"></i>
    </div>
  `;
    }
    handleClick() {
      if (this.props.action) {
        this.props.action();
      }
    }
  };
  var ForwardArrowComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div @click="handleClick" class="ml-5 cursor-pointer">
      <i class="fa fa-angle-right fa-2x"></i>
    </div>
  `;
    }
    handleClick() {
      if (this.props.action) {
        this.props.action();
      }
    }
  };
  var DoubleForwardArrowComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div @click="handleClick" class="ml-5 cursor-pointer">
      <i class="fa fa-angle-double-right fa-2x"></i>
    </div>
  `;
    }
    handleClick() {
      if (this.props.action) {
        this.props.action();
      }
    }
  };
  var MenuIconComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div @click="handleClick" class="mr-5 cursor-pointer z-50">
      <i class="fa fa-bars fa-lg"></i>
    </div>
  `;
    }
    handleClick() {
      return __async(this, null, function* () {
        if (this.props.action) {
          this.props.action();
        }
      });
    }
  };

  // src/client/reactive-textbox-component.ts
  var ReactiveTextboxComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.textboxValue = "";
      this.template = `
    <input :value="textboxValue" type="search" @input="handleInput" $attrs="props" />
  `;
    }
    handleInput(event) {
      this.textboxValue = event.target.value;
      if (this.callbackTimeout) {
        clearTimeout(this.callbackTimeout);
      }
      this.callbackTimeout = setTimeout(() => {
        this.props.callback(this.textboxValue);
        this.callbackTimeout = null;
      }, 400);
    }
  };

  // src/client/team-selection-component.ts
  var RANGE_SIZE = 9;
  var pressAndHoldCallback5;
  var TeamSelectionComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.selectingFor = "USER";
      this.speciesList = [];
      this.selected = [];
      this.userTeam = [];
      this.enemyTeam = [];
      this.rangeStart = 0;
      this.maxRangeStart = 0;
      this.template = `
    <div>

      <div class="mt-5 flex flex-row justify-between">
        <back-arrow-component :action="handleBack"></back-arrow-component>
        <div>
          <reactive-textbox-component
            :callback="(value)=>search(value)"
            placeholder="Search for a Pokemon"
            class="text-sm appearance-none border rounded-lg w-64 sm:w-80 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </reactive-textbox-component>
        </div>
        <menu-icon-component :action="handleMenu"></menu-icon-component>
      </div>

      <div class="h-80 mt-5">

        <div class="grid grid-cols-3 place-items-center">
          <div $for="pokemon in speciesList" class="cursor-pointer" 
              @mousedown="(e)=>handleDown(e,pokemon.name)" 
              @mouseup="(e)=>handleUp(e,pokemon.name)" 
              @touchstart="(e)=>handleDown(e,pokemon.name)" 
              @touchend="(e)=>handleUp(e,pokemon.name)">
            <img class="h-20 w-20 {{getBorder(pokemon.name)}}" 
              src="/sprites/front/{{getSprite(pokemon)}}.png" alt:="pokemon.name" />
            <div class="text-sm text-center mb-5">
              {{pokemon.name}}
            </div>
          </div>
        </div>
      </div>
      <grid-nav-component 
        :f="navForward"
        :df="navDoubleForward"
        :b="navBackward"
        :db="navDoubleBackward"
        :start="rangeStart==0"
        :end="rangeStart==maxRangeStart"
        >
      </grid-nav-component>
      <selected-pokemon-component :team="selected"></selected-pokemon-component>
      <terminal-component></terminal-component>
      <div class="grid grid-cols-2 gap-1">
        <div @click="selectDone" $if="props.client_state!=='WAITING'" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
          Done
        </div>
        <div @click="autoPick" $if="props.client_state!=='WAITING'" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
          Random
        </div>
      </div>
    </div>
  `;
      this.includes = {
        TerminalComponent,
        SelectedPokemonComponent,
        GridNavComponent,
        ReactiveTextboxComponent,
        BackArrowComponent,
        MenuIconComponent
      };
      this.originalSpeciesList = props.unlocked_species.sort((a, b) => {
        return a.pokedexNumber - b.pokedexNumber;
      });
      this.filteredSpeciesList = this.originalSpeciesList;
      this.setMaxRangeStart();
      this.displayRange();
      this.speciesListIndex = createSpeciesListIndex(this.originalSpeciesList);
    }
    afterMount() {
      const upToText = this.props.sub_type === "PRACTICE" ? "up to " : "";
      this.$controller.publish({
        type: "DISPLAY_MESSAGE",
        message: `Select ${upToText}${this.getMaxTeamSize()} Pokemon. Press and hold for more info.`
      });
    }
    getMaxTeamSize() {
      if (this.props.sub_type === "LEAGUE" && this.props.type === "SINGLE_PLAYER") {
        return 4;
      } else {
        return 6;
      }
    }
    handleBack() {
      this.$router.goTo("/");
    }
    setMaxRangeStart() {
      const numberOfWholeRanges = Math.ceil(this.filteredSpeciesList.length / RANGE_SIZE);
      this.maxRangeStart = (numberOfWholeRanges - 1) * RANGE_SIZE;
    }
    handleMenu() {
      return __async(this, null, function* () {
        let result = confirm("Quit battle?");
        if (result) {
          const user = yield getUser();
          if (user.singlePlayerBattleId) {
            const battle = yield getBattle(user.singlePlayerBattleId);
            yield postPlayerAction(battle.battleId, {
              type: "PLAYER_ACTION",
              playerName: user.username,
              details: {
                type: "QUIT_BATTLE"
              }
            });
          }
          this.$router.goTo("/");
        }
      });
    }
    displayRange() {
      this.speciesList = this.filteredSpeciesList.slice(this.rangeStart, this.rangeStart + RANGE_SIZE);
    }
    selectDone() {
      if (this.selected.length === 0) {
        this.$controller.publish({
          type: "DISPLAY_MESSAGE",
          message: `No Pokemon Selected...`
        });
        return;
      }
      if (this.props.sub_type !== "PRACTICE" && this.selected.length < this.getMaxTeamSize()) {
        this.$controller.publish({
          type: "DISPLAY_MESSAGE",
          message: `Select ${this.getMaxTeamSize()} Pokemon.`
        });
        return;
      }
      if (this.props.sub_type === "PRACTICE") {
        if (this.selectingFor === "USER") {
          this.userTeam = this.selected;
          this.selected = [];
          this.selectingFor = "ENEMY";
          this.$controller.publish({
            type: "DISPLAY_MESSAGE",
            message: `Select up to ${this.getMaxTeamSize()} Pokemon for your opponent's team.`
          });
        } else {
          this.enemyTeam = this.selected;
          this.props.select_team(this.userTeam, this.enemyTeam);
        }
      } else {
        this.props.select_team(this.selected, []);
      }
    }
    autoPick() {
      this.selected = automaticallyPickTeam(this.getMaxTeamSize(), this.props.unlocked_species);
    }
    handleDown(event, pokemonName) {
      event.preventDefault();
      pressAndHoldCallback5 = setTimeout(() => {
        const pokemonToShow = this.props.unlocked_species.find((p) => p.name === pokemonName);
        if (pokemonToShow) {
          this.$controller.publish({
            type: "SHOW_POKEMON_CARD",
            pokemon: pokemonToShow,
            isUser: true
          });
        }
        pressAndHoldCallback5 = null;
      }, 500);
    }
    handleUp(event, pokemonName) {
      event.preventDefault();
      if (pressAndHoldCallback5) {
        clearTimeout(pressAndHoldCallback5);
        this.selectPokemon(pokemonName);
      }
    }
    selectPokemon(pokemonName) {
      if (pokemonName) {
        if (this.isSelected(pokemonName)) {
          this.selected = this.selected.filter((e) => e !== pokemonName);
        } else {
          if (this.selected.length < this.getMaxTeamSize()) {
            this.selected.push(pokemonName);
          }
        }
      }
    }
    search(value) {
      this.rangeStart = 0;
      if (value && value.trim()) {
        this.filteredSpeciesList = this.speciesListIndex[normalizeToken(value)] || [];
      } else {
        this.filteredSpeciesList = this.originalSpeciesList;
      }
      this.setMaxRangeStart();
      this.displayRange();
    }
    getBorder(pokemonName) {
      return this.isSelected(pokemonName) ? "border-2  border-green-500 rounded-2xl" : "";
    }
    isSelected(pokemonName) {
      return this.selected.includes(pokemonName);
    }
    navForward() {
      const newRangeStart = this.rangeStart + RANGE_SIZE > this.maxRangeStart ? this.maxRangeStart : this.rangeStart + RANGE_SIZE;
      if (this.rangeStart !== newRangeStart) {
        this.rangeStart = newRangeStart;
      }
      this.displayRange();
    }
    navDoubleForward() {
      if (this.rangeStart !== this.maxRangeStart) {
        this.rangeStart = this.maxRangeStart;
        this.displayRange();
      }
    }
    navBackward() {
      const newRangeStart = this.rangeStart - RANGE_SIZE < 0 ? 0 : this.rangeStart - RANGE_SIZE;
      if (this.rangeStart !== newRangeStart) {
        this.rangeStart = newRangeStart;
        this.displayRange();
      }
    }
    navDoubleBackward() {
      if (this.rangeStart !== 0) {
        this.rangeStart = 0;
        this.displayRange();
      }
    }
  };
  var SelectedPokemonComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="flex flex-row justify-center mb-3">
      <div $if="!props.team.length" class="h-10"></div>
      <img $for="pokemon in getPokemon()" class="h-10 w-10 mx-2 rounded-full" 
        src="/sprites/front/{{pokemon.spriteName}}.png" alt:="pokemon.name" />
    </div>
  `;
    }
    getPokemon() {
      return this.props.team.map((name) => buildPokemon(name));
    }
  };
  var GridNavComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="flex flex-row justify-between px-12 mb-3 mt-6">
      <div class="flex flex-row">
        <span class="mr-5">
          <double-back-arrow-component $if="!props.start" :action="props.db"></double-back-arrow-component>
        </span>
        <span>
          <back-arrow-component $if="!props.start" :action="props.b"></back-arrow-component>
        </span>
      </div>
      <div class="flex flex-row">
        <span>
          <forward-arrow-component $if="!props.end" :action="props.f"></forward-arrow-component>
        </span>
        <span class="ml-5">
          <double-forward-arrow-component $if="!props.end" :action="props.df"></double-forward-arrow-component>
        </span>
      </div>
    </div>
  `;
      this.includes = {
        DoubleBackArrowComponent,
        BackArrowComponent,
        ForwardArrowComponent,
        DoubleForwardArrowComponent
      };
    }
  };

  // src/model/type.ts
  var defensiveEffectivenessMappings = {
    NORMAL: {
      effective: ["FIGHTING"],
      notEffective: [],
      noEffect: ["GHOST"]
    },
    FIRE: {
      effective: ["GROUND", "ROCK", "WATER"],
      notEffective: ["BUG", "STEEL", "FIRE", "GRASS", "ICE", "FAIRY"],
      noEffect: []
    },
    WATER: {
      effective: ["GRASS", "ELECTRIC"],
      notEffective: ["STEEL", "FIRE", "WATER", "ICE"],
      noEffect: []
    },
    ELECTRIC: {
      effective: ["GROUND"],
      notEffective: ["FLYING", "STEEL", "ELECTRIC"],
      noEffect: []
    },
    GRASS: {
      effective: ["FLYING", "POISON", "BUG", "FIRE", "ICE"],
      notEffective: ["GROUND", "WATER", "GRASS", "ELECTRIC"],
      noEffect: []
    },
    ICE: {
      effective: ["FIGHTING", "ROCK", "STEEL", "FIRE"],
      notEffective: ["ICE"],
      noEffect: []
    },
    FIGHTING: {
      effective: ["FLYING", "PSYCHIC", "FAIRY"],
      notEffective: ["ROCK", "BUG", "DARK"],
      noEffect: []
    },
    POISON: {
      effective: ["GROUND", "PSYCHIC"],
      notEffective: ["FIGHTING", "POISON", "BUG", "GRASS", "FAIRY"],
      noEffect: []
    },
    GROUND: {
      effective: ["WATER", "GRASS", "ICE"],
      notEffective: ["POISON", "ROCK"],
      noEffect: ["ELECTRIC"]
    },
    FLYING: {
      effective: ["ROCK", "ELECTRIC", "ICE"],
      notEffective: ["FIGHTING", "BUG", "GRASS"],
      noEffect: ["GROUND"]
    },
    PSYCHIC: {
      effective: ["BUG", "GHOST", "DARK"],
      notEffective: ["FIGHTING", "PSYCHIC"],
      noEffect: []
    },
    BUG: {
      effective: ["FLYING", "ROCK", "FIRE"],
      notEffective: ["FIGHTING", "GROUND", "GRASS"],
      noEffect: []
    },
    ROCK: {
      effective: ["FIGHTING", "GROUND", "STEEL", "WATER", "GRASS"],
      notEffective: ["NORMAL", "FLYING", "POISON", "FIRE"],
      noEffect: []
    },
    GHOST: {
      effective: ["GHOST", "DARK"],
      notEffective: ["POISON", "BUG"],
      noEffect: ["NORMAL", "FIGHTING"]
    },
    DRAGON: {
      effective: ["ICE", "DRAGON", "FAIRY"],
      notEffective: ["FIRE", "WATER", "GRASS", "ELECTRIC"],
      noEffect: []
    },
    DARK: {
      effective: ["FIGHTING", "BUG", "FAIRY"],
      notEffective: ["GHOST", "DARK"],
      noEffect: ["PSYCHIC"]
    },
    STEEL: {
      effective: ["FIGHTING", "GROUND", "FIRE"],
      notEffective: [
        "NORMAL",
        "FLYING",
        "ROCK",
        "BUG",
        "STEEL",
        "GRASS",
        "PSYCHIC",
        "ICE",
        "DRAGON",
        "FAIRY"
      ],
      noEffect: ["POISON"]
    },
    FAIRY: {
      effective: ["POISON", "STEEL"],
      notEffective: ["FIGHTING", "BUG", "DARK"],
      noEffect: ["DRAGON"]
    }
  };
  function getDefensiveEffectivenessForTypes(types, ability) {
    let first = {
      effective: [...defensiveEffectivenessMappings[types[0]].effective],
      notEffective: [...defensiveEffectivenessMappings[types[0]].notEffective],
      noEffect: [...defensiveEffectivenessMappings[types[0]].noEffect]
    };
    if (types.length > 1) {
      let second = defensiveEffectivenessMappings[types[1]];
      second.effective.forEach((t) => {
        if (first.notEffective.includes(t)) {
          first.notEffective = first.notEffective.filter((ft) => ft !== t);
        } else if (!first.effective.includes(t) && !first.noEffect.includes(t)) {
          first.effective.push(t);
        }
      });
      second.notEffective.forEach((t) => {
        if (first.effective.includes(t)) {
          first.effective = first.effective.filter((ft) => ft !== t);
        } else if (!first.notEffective.includes(t) && !first.noEffect.includes(t)) {
          first.notEffective.push(t);
        }
      });
      second.noEffect.forEach((t) => {
        noEffect(first, t);
      });
    }
    if (ability == null ? void 0 : ability.raised) {
      noEffect(first, "GROUND");
    }
    if (ability == null ? void 0 : ability.buffFromAttackType) {
      noEffect(first, ability.buffFromAttackType.type);
    }
    if (ability == null ? void 0 : ability.healFromAttackType) {
      noEffect(first, ability.healFromAttackType.type);
    }
    if (ability == null ? void 0 : ability.wonderGuard) {
      [
        "NORMAL",
        "WATER",
        "ELECTRIC",
        "GRASS",
        "ICE",
        "FIGHTING",
        "POISON",
        "GROUND",
        "PSYCHIC",
        "BUG",
        "DRAGON",
        "STEEL",
        "FAIRY"
      ].forEach((t) => noEffect(first, t));
    }
    return first;
  }
  function noEffect(mapping, type) {
    if (!mapping.noEffect.includes(type)) {
      mapping.noEffect.push(type);
    }
    if (mapping.effective.includes(type)) {
      mapping.effective = mapping.effective.filter((ft) => ft !== type);
    }
    if (mapping.notEffective.includes(type)) {
      mapping.notEffective = mapping.notEffective.filter((ft) => ft !== type);
    }
  }

  // src/client/pokemon-card-component.ts
  var PokemonCardComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.defensiveEffectiveness = null;
      this.template = `
    <div class="">
      <div class="grid justify-items-center">
        <span class="text-lg mb-1">
        {{props.species.name.toUpperCase()}}
        </span>
        <span $if="props.league" class="text-sm text-gray-600 mb-1">
          Lv{{props.species.level}}
        </span>
        <img class="h-24" src="/sprites/front/{{getSprite(props.species)}}.png" />
        <types-row :types="props.species.types"></types-row>
      </div>
      <div class="mt-2 mb-2 p-1">
        <stat-row-component desc="HP" :value="props.species.hp">
        </stat-row-component>
        <stat-row-component desc="ATTACK" :value="props.species.attack">
        </stat-row-component>
        <stat-row-component desc="DEFENSE" :value="props.species.defense">
        </stat-row-component>
        <stat-row-component desc="SP. ATK" :value="props.species.specialAttack">
        </stat-row-component>
        <stat-row-component desc="SP. DEF" :value="props.species.specialDefense">
        </stat-row-component>
        <stat-row-component desc="SPEED" :value="props.species.speed">
        </stat-row-component>
      </div>
      <moves-component $if="!props.league" :moves="props.species.moves" :action="props.click_move"></moves-component>
      <tab-switcher :species="props.species"
        :click_move="props.click_move"
        :league="props.league"
        :eff="defensiveEffectiveness">
      </tab-switcher>
    </div>
  `;
      this.includes = {
        StatRowComponent,
        TypesRow,
        TypeCardComponent,
        TabSwitcher,
        MovesComponent
      };
      this.defensiveEffectiveness = getDefensiveEffectivenessForTypes(props.species.types, props.species.ability);
    }
  };
  var TypesRow = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="flex flex-row">
      <type-card-component :type="props.types[0]"></type-card-component>
      <div class="ml-2">
        <type-card-component $if="props.types.length > 1" :type="props.types[1]"></type-card-component>
      </div>
    </div>
  `;
      this.includes = {
        TypeCardComponent
      };
    }
  };
  var MAX_PERCENT = 100;
  var MIN_PERCENT = 8;
  var StatRowComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="flex flex-row items-center mb-1">
      <div class="mr-1 w-16 text-xs text-right">
        {{props.desc}}
      </div>
      <div class="w-48 rounded-lg">
        <div style="width: {{getPercent()}}%;" class="{{getColor()}} h-2 rounded-lg border border-solid border-gray-500">
        </div>
      </div>
    </div>
  `;
    }
    getPercent() {
      let percent = this.props.value - 45;
      if (percent > MAX_PERCENT) {
        percent = MAX_PERCENT;
      }
      if (percent < MIN_PERCENT) {
        percent = MIN_PERCENT;
      }
      return percent;
    }
    getColor() {
      const value = this.props.value;
      if (value >= 150) {
        return "stat-bar-best";
      } else if (value >= 120) {
        return "stat-bar-verygood";
      } else if (value >= 90) {
        return "stat-bar-good";
      } else if (value >= 60) {
        return "stat-bar-ok";
      } else if (value >= 35) {
        return "stat-bar-bad";
      } else {
        return "stat-bar-worst";
      }
    }
  };
  var MovesComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="">
      <div :class="props.moves.length === 1 ? 'grid grid-cols-1 mx-10' : 'grid grid-cols-2 gap-1'">
        <div $for="move in props.moves" @click="clickHandler(move)" style="background-color: {{getBgColor(move.type)}};" class="{{getCursor()}} text-xs rounded text-white text-center p-1 border border-solid border-gray-500">
          {{move.name.toUpperCase()}}
        </div>
      </div>
    </div>
  `;
    }
    getBgColor(type) {
      return TYPE_COLORS[type];
    }
    getCursor() {
      return this.props.action ? "cursor-pointer" : "";
    }
    clickHandler(move) {
      if (this.props.action) {
        return () => this.props.action(move);
      } else {
        return () => {
        };
      }
    }
  };
  var DefensiveTypeEffectivenessComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="">
      <div $if="props.eff.effective.length" class="mt-2">
        <h2 class="text-center font-semibold">Effective</h2>
        <div class="flex flex-row justify-center flex-wrap">
          <type-card-component $for="type in props.eff.effective" :type="type"></type-card-component>
        </div>
      </div>
      <div $if="props.eff.notEffective.length" class="mt-2">
        <h2 class="text-center font-semibold">Not Effective</h2>
        <div class="flex flex-row justify-center flex-wrap">
          <type-card-component $for="type in props.eff.notEffective" :type="type"></type-card-component>
        </div>
      </div>
      <div $if="props.eff.noEffect.length" class="mt-2">
        <h2 class="text-center font-semibold">No Effect</h2>
        <div class="flex flex-row justify-center flex-wrap">
          <type-card-component $for="type in props.eff.noEffect" :type="type"></type-card-component>
        </div>
      </div>
    </div>
  `;
      this.includes = {
        TypeCardComponent
      };
    }
  };
  var TabSwitcher = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.ability = "Ability";
      this.types = "Type Eff.";
      this.selected = this.ability;
      this.template = `
    <div class="mt-4">
      <div class="grid grid-cols-2">
        <tab-title :text="ability" :click="()=>this.switch(ability)" :selected="selected"></tab-title>
        <tab-title :text="types" :click="()=>this.switch(types)" :selected="selected"></tab-title>
      </div>
      <div class="p-2 text-sm border-b border-r border-l border-solid border-gray-300 rounded-b-lg" style="min-height: 140px">
        <div $if="selected == ability" class="">
          <h2 class="text-center font-semibold">{{props.species.ability.name}}</h2>
          <p class="mt-1 text-xs pr-3 pl-3">
            {{props.species.ability.desc}}
          </p>
        </div>
        <defensive-type-effectiveness-component $if="selected == types" :eff="props.eff">
        </defensive-type-effectiveness-component>
      </div>
    </div>
  `;
      this.includes = {
        TabTitle,
        MovesComponent,
        DefensiveTypeEffectivenessComponent
      };
    }
    switch(newTab) {
      this.selected = newTab;
    }
  };
  var TabTitle = class {
    constructor() {
      this.template = `
    <span @click="props.click" class="text-center {{props.selected == props.text ? '' : 'bg-gray-200'}} {{props.selected == props.text ? '' : 'cursor-pointer'}} text-sm font-medium py-1 px-3 rounded-t-lg border-t border-r border-l border-solid border-gray-300">
      {{props.text}}
    </span>
  `;
    }
  };

  // src/client/move-card-component.ts
  var the_move = moves["Flamethrower"];
  var MoveCardComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
  <div class="mt-3" style="min-width: 250px;">
      <div class="grid justify-items-center">
        <span class="text-lg mb-5">
          {{props.move.name.toUpperCase()}}
        </span>

        <div class="grid grid-cols-2 gap-1">
          <div class="text-right mr-1 text-gray-600">Type:</div>
          <type-card-component :type="props.move.type"></type-card-component>
          <div class="text-right mr-1 text-gray-600">Category:</div>
          <div class="flex flex-row">
            <img class="h-5 mr-2" src="/img/category-{{props.move.category.toLowerCase()}}.png" :alt="props.move.category" />
            <span>{{getCategoryDesc(props.move.category)}}</span>
          </div>
          <div class="text-right mr-1 text-gray-600">Power:</div>
          <div>{{props.move.power ? props.move.power : '-'}}</div>
          <div class="text-right mr-1 text-gray-600">Accuracy:</div>
          <div $if="props.move.effects?.ignoreAccuracyAndEvasion">-</div>
          <div $if="!props.move.effects?.ignoreAccuracyAndEvasion">{{props.move.accuracy ? Math.floor(props.move.accuracy * 100) : 100}}%</div>
          <div class="text-right mr-1 text-gray-600">PP:</div>
          <div>{{props.move.startingPP}}</div>
          <div $if="props.move.category !== 'STATUS'" class="text-right mr-1 text-gray-600">Contact:</div>
          <div $if="props.move.category !== 'STATUS'">{{makesContact(props.move) ? 'Yes' : 'No'}}</div>
          <div $if="props.move.priority" class="text-right mr-1 text-gray-600">Priority:</div>
          <div $if="props.move.priority">{{props.move.priority > 0 ? '+' : ''}}{{props.move.priority}}</div>
        </div>
        <hr>
        <div class="mt-3 p-3">
          <p>{{getMoveDescription(props.move) ? getMoveDescription(props.move) : 'Deals damage with no additional effect.'}}</p>
        </div>
      </div>
    </div>
  `;
      this.includes = {
        TypeCardComponent
      };
    }
    getBgColor(type) {
      return TYPE_COLORS[type];
    }
    getCategoryDesc(category) {
      const lower = category.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    makesContact(move) {
      return makesContact(move);
    }
  };

  // src/client/enemy-preview-component.ts
  var EnemyPreviewComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.template = `
    <div>
      <div class="my-8">
        <div class="flex flex-row justify-center">
            <div class="grid grid-cols-2 {{props.enemy.team.length == 5 || props.enemy.team.length == 6 ? '' : 'mt-10'}}">
              <span $for="pokemon, i in props.enemy.team">
                <img $if="props.enemy.team.length<8 || i < 4" @click="()=>showPokemon(pokemon)" class="h-12 cursor-pointer" src="/sprites/front/{{getSprite(pokemon)}}.png">
              </span>
            </div>
            <img class="h-36 block" src="/sprites/trainers/{{props.enemy.avatar}}.png">
              <div $if="props.enemy.team.length==8" class="grid grid-cols-2 mt-10">
                <span $for="pokemon, i in props.enemy.team">
                  <img $if="i > 3" @click="()=>showPokemon(pokemon)" class="h-12 cursor-pointer" src="/sprites/front/{{getSprite(pokemon)}}.png">
                </span>
              </div>
        </div>
      </div>
    </div>
  `;
    }
    showPokemon(pokemon) {
      this.$controller.publish({
        type: "SHOW_POKEMON_CARD",
        pokemon,
        isUser: false
      });
    }
  };

  // src/client/new-unlocks-component.ts
  var NewUnlocksComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.template = `
        <div class="flex flex-row justify-center flex-wrap">
            <div $for="unlock in unlocks">
                <img @click="()=>handleClick(unlock)" $class="{silhouette: !unlock.revealed}" class="h-32 w-32 cursor-pointer mx-8" src="/sprites/front/{{getSprite(unlock.species)}}.png">
            </div>
        </div>
    `;
      this.unlocks = props.unlocks.map((n) => {
        const species = speciesList.find((s) => s.pokedexNumber === n);
        return {
          species,
          revealed: false
        };
      });
    }
    beforeMount() {
      this.$controller.subscribe("REVEAL_UNLOCKED_POKEMON", this.handleRevealUnlockedPokemon);
    }
    beforeUnmount() {
      this.$controller.unsubscribe("REVEAL_UNLOCKED_POKEMON", this.handleRevealUnlockedPokemon);
    }
    handleRevealUnlockedPokemon(event) {
      return __async(this, null, function* () {
        const unlock = this.unlocks[event.index];
        unlock.revealed = true;
        const cry = getCry(unlock.species);
        playCry(cry);
      });
    }
    handleClick(unlock) {
      if (unlock.revealed) {
        this.$controller.publish({
          type: "SHOW_POKEMON_CARD",
          pokemon: unlock.species,
          isUser: true
        });
      }
    }
  };

  // node_modules/canvas-confetti/dist/confetti.module.mjs
  var module = {};
  (function main(global, module2, isWorker, workerSize) {
    var canUseWorker = !!(global.Worker && global.Blob && global.Promise && global.OffscreenCanvas && global.OffscreenCanvasRenderingContext2D && global.HTMLCanvasElement && global.HTMLCanvasElement.prototype.transferControlToOffscreen && global.URL && global.URL.createObjectURL);
    function noop() {
    }
    function promise(func) {
      var ModulePromise = module2.exports.Promise;
      var Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise;
      if (typeof Prom === "function") {
        return new Prom(func);
      }
      func(noop, noop);
      return null;
    }
    var raf = function() {
      var TIME = Math.floor(1e3 / 60);
      var frame, cancel;
      var frames = {};
      var lastFrameTime = 0;
      if (typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function") {
        frame = function(cb) {
          var id = Math.random();
          frames[id] = requestAnimationFrame(function onFrame(time) {
            if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
              lastFrameTime = time;
              delete frames[id];
              cb();
            } else {
              frames[id] = requestAnimationFrame(onFrame);
            }
          });
          return id;
        };
        cancel = function(id) {
          if (frames[id]) {
            cancelAnimationFrame(frames[id]);
          }
        };
      } else {
        frame = function(cb) {
          return setTimeout(cb, TIME);
        };
        cancel = function(timer) {
          return clearTimeout(timer);
        };
      }
      return { frame, cancel };
    }();
    var getWorker = function() {
      var worker;
      var prom;
      var resolves = {};
      function decorate(worker2) {
        function execute(options, callback) {
          worker2.postMessage({ options: options || {}, callback });
        }
        worker2.init = function initWorker(canvas) {
          var offscreen = canvas.transferControlToOffscreen();
          worker2.postMessage({ canvas: offscreen }, [offscreen]);
        };
        worker2.fire = function fireWorker(options, size, done) {
          if (prom) {
            execute(options, null);
            return prom;
          }
          var id = Math.random().toString(36).slice(2);
          prom = promise(function(resolve) {
            function workerDone(msg) {
              if (msg.data.callback !== id) {
                return;
              }
              delete resolves[id];
              worker2.removeEventListener("message", workerDone);
              prom = null;
              done();
              resolve();
            }
            worker2.addEventListener("message", workerDone);
            execute(options, id);
            resolves[id] = workerDone.bind(null, { data: { callback: id } });
          });
          return prom;
        };
        worker2.reset = function resetWorker() {
          worker2.postMessage({ reset: true });
          for (var id in resolves) {
            resolves[id]();
            delete resolves[id];
          }
        };
      }
      return function() {
        if (worker) {
          return worker;
        }
        if (!isWorker && canUseWorker) {
          var code = [
            "var CONFETTI, SIZE = {}, module = {};",
            "(" + main.toString() + ")(this, module, true, SIZE);",
            "onmessage = function(msg) {",
            "  if (msg.data.options) {",
            "    CONFETTI(msg.data.options).then(function () {",
            "      if (msg.data.callback) {",
            "        postMessage({ callback: msg.data.callback });",
            "      }",
            "    });",
            "  } else if (msg.data.reset) {",
            "    CONFETTI.reset();",
            "  } else if (msg.data.resize) {",
            "    SIZE.width = msg.data.resize.width;",
            "    SIZE.height = msg.data.resize.height;",
            "  } else if (msg.data.canvas) {",
            "    SIZE.width = msg.data.canvas.width;",
            "    SIZE.height = msg.data.canvas.height;",
            "    CONFETTI = module.exports.create(msg.data.canvas);",
            "  }",
            "}"
          ].join("\n");
          try {
            worker = new Worker(URL.createObjectURL(new Blob([code])));
          } catch (e) {
            typeof console !== void 0 && typeof console.warn === "function" ? console.warn("\u{1F38A} Could not load worker", e) : null;
            return null;
          }
          decorate(worker);
        }
        return worker;
      };
    }();
    var defaults = {
      particleCount: 50,
      angle: 90,
      spread: 45,
      startVelocity: 45,
      decay: 0.9,
      gravity: 1,
      drift: 0,
      ticks: 200,
      x: 0.5,
      y: 0.5,
      shapes: ["square", "circle"],
      zIndex: 100,
      colors: [
        "#26ccff",
        "#a25afd",
        "#ff5e7e",
        "#88ff5a",
        "#fcff42",
        "#ffa62d",
        "#ff36ff"
      ],
      disableForReducedMotion: false,
      scalar: 1
    };
    function convert(val, transform) {
      return transform ? transform(val) : val;
    }
    function isOk(val) {
      return !(val === null || val === void 0);
    }
    function prop(options, name, transform) {
      return convert(options && isOk(options[name]) ? options[name] : defaults[name], transform);
    }
    function onlyPositiveInt(number) {
      return number < 0 ? 0 : Math.floor(number);
    }
    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }
    function toDecimal(str) {
      return parseInt(str, 16);
    }
    function colorsToRgb(colors) {
      return colors.map(hexToRgb);
    }
    function hexToRgb(str) {
      var val = String(str).replace(/[^0-9a-f]/gi, "");
      if (val.length < 6) {
        val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
      }
      return {
        r: toDecimal(val.substring(0, 2)),
        g: toDecimal(val.substring(2, 4)),
        b: toDecimal(val.substring(4, 6))
      };
    }
    function getOrigin(options) {
      var origin = prop(options, "origin", Object);
      origin.x = prop(origin, "x", Number);
      origin.y = prop(origin, "y", Number);
      return origin;
    }
    function setCanvasWindowSize(canvas) {
      canvas.width = document.documentElement.clientWidth;
      canvas.height = document.documentElement.clientHeight;
    }
    function setCanvasRectSize(canvas) {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    function getCanvas(zIndex) {
      var canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0px";
      canvas.style.left = "0px";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = zIndex;
      return canvas;
    }
    function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(radiusX, radiusY);
      context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
      context.restore();
    }
    function randomPhysics(opts) {
      var radAngle = opts.angle * (Math.PI / 180);
      var radSpread = opts.spread * (Math.PI / 180);
      return {
        x: opts.x,
        y: opts.y,
        wobble: Math.random() * 10,
        velocity: opts.startVelocity * 0.5 + Math.random() * opts.startVelocity,
        angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
        tiltAngle: Math.random() * Math.PI,
        color: opts.color,
        shape: opts.shape,
        tick: 0,
        totalTicks: opts.ticks,
        decay: opts.decay,
        drift: opts.drift,
        random: Math.random() + 5,
        tiltSin: 0,
        tiltCos: 0,
        wobbleX: 0,
        wobbleY: 0,
        gravity: opts.gravity * 3,
        ovalScalar: 0.6,
        scalar: opts.scalar
      };
    }
    function updateFetti(context, fetti) {
      fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift;
      fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
      fetti.wobble += 0.1;
      fetti.velocity *= fetti.decay;
      fetti.tiltAngle += 0.1;
      fetti.tiltSin = Math.sin(fetti.tiltAngle);
      fetti.tiltCos = Math.cos(fetti.tiltAngle);
      fetti.random = Math.random() + 5;
      fetti.wobbleX = fetti.x + 10 * fetti.scalar * Math.cos(fetti.wobble);
      fetti.wobbleY = fetti.y + 10 * fetti.scalar * Math.sin(fetti.wobble);
      var progress = fetti.tick++ / fetti.totalTicks;
      var x1 = fetti.x + fetti.random * fetti.tiltCos;
      var y1 = fetti.y + fetti.random * fetti.tiltSin;
      var x2 = fetti.wobbleX + fetti.random * fetti.tiltCos;
      var y2 = fetti.wobbleY + fetti.random * fetti.tiltSin;
      context.fillStyle = "rgba(" + fetti.color.r + ", " + fetti.color.g + ", " + fetti.color.b + ", " + (1 - progress) + ")";
      context.beginPath();
      if (fetti.shape === "circle") {
        context.ellipse ? context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) : ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
      } else {
        context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
        context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
        context.lineTo(Math.floor(x2), Math.floor(y2));
        context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
      }
      context.closePath();
      context.fill();
      return fetti.tick < fetti.totalTicks;
    }
    function animate(canvas, fettis, resizer, size, done) {
      var animatingFettis = fettis.slice();
      var context = canvas.getContext("2d");
      var animationFrame;
      var destroy;
      var prom = promise(function(resolve) {
        function onDone() {
          animationFrame = destroy = null;
          context.clearRect(0, 0, size.width, size.height);
          done();
          resolve();
        }
        function update() {
          if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
            size.width = canvas.width = workerSize.width;
            size.height = canvas.height = workerSize.height;
          }
          if (!size.width && !size.height) {
            resizer(canvas);
            size.width = canvas.width;
            size.height = canvas.height;
          }
          context.clearRect(0, 0, size.width, size.height);
          animatingFettis = animatingFettis.filter(function(fetti) {
            return updateFetti(context, fetti);
          });
          if (animatingFettis.length) {
            animationFrame = raf.frame(update);
          } else {
            onDone();
          }
        }
        animationFrame = raf.frame(update);
        destroy = onDone;
      });
      return {
        addFettis: function(fettis2) {
          animatingFettis = animatingFettis.concat(fettis2);
          return prom;
        },
        canvas,
        promise: prom,
        reset: function() {
          if (animationFrame) {
            raf.cancel(animationFrame);
          }
          if (destroy) {
            destroy();
          }
        }
      };
    }
    function confettiCannon(canvas, globalOpts) {
      var isLibCanvas = !canvas;
      var allowResize = !!prop(globalOpts || {}, "resize");
      var globalDisableForReducedMotion = prop(globalOpts, "disableForReducedMotion", Boolean);
      var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, "useWorker");
      var worker = shouldUseWorker ? getWorker() : null;
      var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
      var initialized = canvas && worker ? !!canvas.__confetti_initialized : false;
      var preferLessMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion)").matches;
      var animationObj;
      function fireLocal(options, size, done) {
        var particleCount = prop(options, "particleCount", onlyPositiveInt);
        var angle = prop(options, "angle", Number);
        var spread = prop(options, "spread", Number);
        var startVelocity = prop(options, "startVelocity", Number);
        var decay = prop(options, "decay", Number);
        var gravity = prop(options, "gravity", Number);
        var drift = prop(options, "drift", Number);
        var colors = prop(options, "colors", colorsToRgb);
        var ticks = prop(options, "ticks", Number);
        var shapes = prop(options, "shapes");
        var scalar = prop(options, "scalar");
        var origin = getOrigin(options);
        var temp = particleCount;
        var fettis = [];
        var startX = canvas.width * origin.x;
        var startY = canvas.height * origin.y;
        while (temp--) {
          fettis.push(randomPhysics({
            x: startX,
            y: startY,
            angle,
            spread,
            startVelocity,
            color: colors[temp % colors.length],
            shape: shapes[randomInt(0, shapes.length)],
            ticks,
            decay,
            gravity,
            drift,
            scalar
          }));
        }
        if (animationObj) {
          return animationObj.addFettis(fettis);
        }
        animationObj = animate(canvas, fettis, resizer, size, done);
        return animationObj.promise;
      }
      function fire(options) {
        var disableForReducedMotion = globalDisableForReducedMotion || prop(options, "disableForReducedMotion", Boolean);
        var zIndex = prop(options, "zIndex", Number);
        if (disableForReducedMotion && preferLessMotion) {
          return promise(function(resolve) {
            resolve();
          });
        }
        if (isLibCanvas && animationObj) {
          canvas = animationObj.canvas;
        } else if (isLibCanvas && !canvas) {
          canvas = getCanvas(zIndex);
          document.body.appendChild(canvas);
        }
        if (allowResize && !initialized) {
          resizer(canvas);
        }
        var size = {
          width: canvas.width,
          height: canvas.height
        };
        if (worker && !initialized) {
          worker.init(canvas);
        }
        initialized = true;
        if (worker) {
          canvas.__confetti_initialized = true;
        }
        function onResize() {
          if (worker) {
            var obj = {
              getBoundingClientRect: function() {
                if (!isLibCanvas) {
                  return canvas.getBoundingClientRect();
                }
              }
            };
            resizer(obj);
            worker.postMessage({
              resize: {
                width: obj.width,
                height: obj.height
              }
            });
            return;
          }
          size.width = size.height = null;
        }
        function done() {
          animationObj = null;
          if (allowResize) {
            global.removeEventListener("resize", onResize);
          }
          if (isLibCanvas && canvas) {
            document.body.removeChild(canvas);
            canvas = null;
            initialized = false;
          }
        }
        if (allowResize) {
          global.addEventListener("resize", onResize, false);
        }
        if (worker) {
          return worker.fire(options, size, done);
        }
        return fireLocal(options, size, done);
      }
      fire.reset = function() {
        if (worker) {
          worker.reset();
        }
        if (animationObj) {
          animationObj.reset();
        }
      };
      return fire;
    }
    module2.exports = confettiCannon(null, { useWorker: true, resize: true });
    module2.exports.create = confettiCannon;
  })(function() {
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof self !== "undefined") {
      return self;
    }
    return this || {};
  }(), module, false);
  var confetti_module_default = module.exports;
  var create = module.exports.create;

  // src/client/battle-component.ts
  var BattleComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.pokemonInModal = void 0;
      this.pokemonModalForUser = false;
      this.moveInModal = void 0;
      this.winnerName = null;
      this.template = `
    <div>
      <div $if="battleState!=='SELECTING_TEAM'" class="mt-5 flex flex-row justify-between">
        <back-arrow-component :action="handleBack"></back-arrow-component>
        <menu-icon-component :action="handleMenu"></menu-icon-component>
      </div>

      <modal-component $if="pokemonInModal" :close="closePokemonModal">
        <div style="max-width: 300px;" class="bg-white p-5 mx-auto">
          <pokemon-card-component :species="pokemonInModal" :click_move="(move)=>showMoveCard(move)" :league="props.battle.battleSubType === 'LEAGUE' && !pokemonModalForUser"></pokemon-card-component>
        </div>
      </modal-component>
      <modal-component $if="moveInModal" :close="closeMoveModal">
        <div style="max-width: 300px;" class="bg-white p-5 mx-auto">
          <move-card-component :move="moveInModal"></move-card-component>
        </div>
      </modal-component>
    
      <team-selection-component $if="battleState==='SELECTING_TEAM'" 
        :type="props.battle.battleType" :sub_type="props.battle.battleSubType" 
        :select_team="selectTeam" :client_state="clientState"
        :unlocked_species="props.unlocked_species">
      </team-selection-component>

      <div $if="battleState!=='SELECTING_TEAM' && this.userPokemon && this.enemyPokemon">
        <enemy-preview-component $if="showEnemyPreview()" :user="user" :enemy="enemy">
        </enemy-preview-component>
        <battle-zone-component $if="showBattleZone()" 
          :user="userPokemon" :user_player="user" :user_animation_ctx="userAnimationContext"
          :enemy="enemyPokemon" :enemy_player="enemy" :enemy_animation_ctx="enemyAnimationContext"
          >
        </battle-zone-component>
        <new-unlocks-component $if="clientState==='SHOWING_NEW_UNLOCKS'" :unlocks="newUnlocks">
        </new-unlocks-component>
        <terminal-component>
        </terminal-component>
        <action-buttons-component $if="showActionButtons()" :battle_id="props.battle.battleId" :user_pokemon="userPokemon" :enemy_pokemon="enemyPokemon">
        </action-buttons-component>
        <pokemon-buttons-component $if="showPokemonButtons()" :team="user.team" :cancellable="isCancellable()" :current="user.activePokemonIndex">
        </pokemon-buttons-component>
        <move-buttons-component $if="showMoveButtons()" :moves="userPokemon.moves">
        </move-buttons-component>
        <game-over-buttons-component $if="showGameOverButtons()" :battle="props.battle" :won="user.name === winnerName">
        </game-over-buttons-component>
      </div>

    </div>
  `;
      this.includes = {
        NewUnlocksComponent,
        TeamSelectionComponent,
        TerminalComponent,
        BattleZoneComponent,
        EnemyPreviewComponent,
        MoveButtonsComponent,
        PokemonButtonsComponent,
        ActionButtonsComponent,
        WideButtonComponent,
        GameOverButtonsComponent,
        PokemonCardComponent,
        MoveCardComponent,
        BackArrowComponent,
        MenuIconComponent
      };
      this.battleState = props.battle.battleState;
      this.clientState = "PLAYING_ANIMATIONS";
      const { user, enemy } = getPlayers(props.battle);
      this.user = user;
      this.userPokemon = user.team[user.activePokemonIndex];
      this.userAnimationContext = defaultAnimationContext();
      this.enemy = enemy;
      this.enemyPokemon = enemy.team[enemy.activePokemonIndex];
      this.enemyAnimationContext = defaultAnimationContext();
      this.winnerName = props.battle.winnerName ? props.battle.winnerName : null;
    }
    beforeMount() {
      this.$controller.subscribe("BATTLE_STATE_CHANGE", this.handleBattleStateChange);
      this.$controller.subscribe("CLIENT_STATE_CHANGE", this.handleClientStateChange);
      this.$controller.subscribe("HEALTH_CHANGE", this.handleHealthChange);
      this.$controller.subscribe("SOUND_EFFECT", this.handleSoundEffect);
      this.$controller.subscribe("DEPLOY", this.handleDeploy);
      this.$controller.subscribe("PP_CHANGE", this.handlePPChange);
      this.$controller.subscribe("FAINT", this.handleFaint);
      this.$controller.subscribe("STATUS_CHANGE", this.handleStatusChange);
      this.$controller.subscribe("BIND_CHANGE", this.handleBindChange);
      this.$controller.subscribe("TRANSFORM", this.handleTransform);
      this.$controller.subscribe("TRANSFORM_STANCE_CHANGE", this.handleTransformStanceChange);
      this.$controller.subscribe("TEAM_SELECTED", this.handleTeamSelected);
      this.$controller.subscribe("SHOW_POKEMON_CARD", this.handleShowPokemonCard);
      this.$controller.subscribe("SHOW_MOVE_CARD", this.handleShowMoveCard);
      this.$controller.subscribe("WEATHER_CHANGE", this.handleWeatherChange);
      this.$controller.subscribe("UNLOCK_POKEMON", this.handleUnlockPokemon);
      this.$controller.subscribe("GAME_OVER", this.handleGameOver);
      this.setWeather(this.props.battle.weather);
    }
    beforeUnmount() {
      this.$controller.unsubscribe("BATTLE_STATE_CHANGE", this.handleBattleStateChange);
      this.$controller.unsubscribe("CLIENT_STATE_CHANGE", this.handleClientStateChange);
      this.$controller.unsubscribe("HEALTH_CHANGE", this.handleHealthChange);
      this.$controller.unsubscribe("SOUND_EFFECT", this.handleSoundEffect);
      this.$controller.unsubscribe("DEPLOY", this.handleDeploy);
      this.$controller.unsubscribe("PP_CHANGE", this.handlePPChange);
      this.$controller.unsubscribe("FAINT", this.handleFaint);
      this.$controller.unsubscribe("STATUS_CHANGE", this.handleStatusChange);
      this.$controller.unsubscribe("BIND_CHANGE", this.handleBindChange);
      this.$controller.unsubscribe("TRANSFORM", this.handleTransform);
      this.$controller.unsubscribe("TRANSFORM_STANCE_CHANGE", this.handleTransformStanceChange);
      this.$controller.unsubscribe("TEAM_SELECTED", this.handleTeamSelected);
      this.$controller.unsubscribe("SHOW_POKEMON_CARD", this.handleShowPokemonCard);
      this.$controller.unsubscribe("SHOW_MOVE_CARD", this.handleShowMoveCard);
      this.$controller.unsubscribe("WEATHER_CHANGE", this.handleWeatherChange);
      this.$controller.unsubscribe("UNLOCK_POKEMON", this.handleUnlockPokemon);
      this.$controller.unsubscribe("GAME_OVER", this.handleGameOver);
    }
    handleBack() {
      this.$router.goTo("/");
    }
    handleMenu() {
      return __async(this, null, function* () {
        let result = confirm("Concede battle?");
        if (result) {
          const user = yield getUser();
          if (user.singlePlayerBattleId) {
            const battle = yield getBattle(user.singlePlayerBattleId);
            yield postPlayerAction(battle.battleId, {
              type: "PLAYER_ACTION",
              playerName: user.username,
              details: {
                type: "QUIT_BATTLE"
              }
            });
          }
          this.$router.goTo("/");
        }
      });
    }
    selectTeam(userTeam, enemyTeam) {
      return __async(this, null, function* () {
        const username = getUserName();
        this.$controller.publish({
          type: "PLAYER_ACTION",
          playerName: username,
          details: {
            type: "SELECT_TEAM",
            pokemonNames: userTeam,
            enemyPokemonNames: enemyTeam
          }
        });
        playMusic("battle.mp3");
      });
    }
    handleTeamSelected(event) {
      return __async(this, null, function* () {
        if (event.playerName === this.getUser()) {
          this.user.team = event.team;
          this.userPokemon = this.user.team[0];
        } else {
          this.enemy.team = event.team;
          this.enemyPokemon = this.enemy.team[0];
        }
      });
    }
    handleShowPokemonCard(event) {
      const pokemonOrSpecies = event.pokemon;
      this.pokemonInModal = pokemonOrSpecies.species ? pokemonOrSpecies.species : pokemonOrSpecies;
      this.pokemonModalForUser = event.isUser;
    }
    handleShowMoveCard(event) {
      this.moveInModal = event.move;
    }
    showMoveCard(move) {
      this.$controller.publish({
        type: "SHOW_MOVE_CARD",
        move
      });
    }
    handleWeatherChange(event) {
      return __async(this, null, function* () {
        this.setWeather(event.newWeather);
        yield sleep(500);
      });
    }
    handleUnlockPokemon(event) {
      return __async(this, null, function* () {
        this.newUnlocks = event.dexNumbers;
        this.clientState = "SHOWING_NEW_UNLOCKS";
        yield this.$controller.publish({
          type: "DISPLAY_MESSAGE",
          message: "You unlocked new Pokemon!"
        });
        for (let i = 0; i < event.dexNumbers.length; i++) {
          yield this.$controller.publish({
            type: "REVEAL_UNLOCKED_POKEMON",
            index: i
          });
          yield sleep(1300);
        }
        if (event.isLastPokemon) {
          yield this.$controller.publish({
            type: "DISPLAY_MESSAGE",
            message: "You completed the Pokedex!!!"
          });
          this.doConfetti();
          yield sleep(5e3);
          yield this.$controller.publish({
            type: "DISPLAY_MESSAGE",
            message: "Thank you for playing!"
          });
        }
      });
    }
    doConfetti() {
      var end = Date.now() + 3 * 1e3;
      var colors = ["#bb0000", "#ffffff"];
      (function frame() {
        confetti_module_default({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti_module_default({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
    handleGameOver(event) {
      return __async(this, null, function* () {
        this.winnerName = event.winnerName;
      });
    }
    setWeather(newWeather) {
      document.body.setAttribute("data-weather", newWeather);
    }
    closePokemonModal() {
      this.pokemonInModal = void 0;
      this.pokemonModalForUser = false;
    }
    closeMoveModal() {
      this.moveInModal = void 0;
    }
    handleBattleStateChange(event) {
      if (this.battleState === "SELECTING_FIRST_POKEMON" && event.newState !== "SELECTING_FIRST_POKEMON") {
        this.userAnimationContext.isDeploying = true;
        this.enemyAnimationContext.isDeploying = true;
      }
      this.battleState = event.newState;
    }
    handleClientStateChange(event) {
      this.clientState = event.newState;
    }
    showEnemyPreview() {
      return this.battleState === "SELECTING_FIRST_POKEMON";
    }
    showBattleZone() {
      return this.battleState !== "SELECTING_FIRST_POKEMON" && this.clientState !== "SHOWING_NEW_UNLOCKS";
    }
    showPokemonButtons() {
      return this.clientState === "SELECTING_POKEMON";
    }
    showActionButtons() {
      return this.clientState === "SELECTING_ACTION" && this.battleState !== "GAME_OVER";
    }
    showMoveButtons() {
      return this.clientState === "SELECTING_MOVE";
    }
    showGameOverButtons() {
      return (this.winnerName != null || this.clientState === "SHOWING_NEW_UNLOCKS") && this.battleState === "GAME_OVER";
    }
    getUser() {
      return getUserName();
    }
    toggleUser() {
      location.reload();
    }
    handleSoundEffect(event) {
      return __async(this, null, function* () {
        if (getUserSettings().soundEffects) {
          if (event.soundType === "MOVE") {
            playMoveSound(event.fileName);
            yield sleep(200);
          } else if (event.soundType === "MUSIC") {
            if (event.forPlayerName === getUserName()) {
              if (event.stopMusic) {
                stopMusic();
              } else {
                playMusic(event.fileName);
              }
            }
          }
        }
      });
    }
    handleHealthChange(event) {
      return __async(this, null, function* () {
        if (event.newHP < event.oldHP) {
          yield this.$controller.publish({
            type: "TAKE_DAMAGE_ANIMATION",
            playerName: event.playerName,
            directAttack: event.directAttack,
            playSound: event.playSound
          });
        } else if (event.newHP > event.oldHP) {
          yield this.$controller.publish({
            type: "HEAL_ANIMATION",
            playerName: event.playerName
          });
        }
        yield this.$controller.publish({
          type: "HEALTH_BAR_ANIMATION",
          playerName: event.playerName,
          newHP: event.newHP,
          oldHP: event.oldHP,
          totalHP: event.totalHP
        });
        if (event.playerName === this.getUser()) {
          this.userPokemon.hp = event.newHP;
          this.user.team[this.user.activePokemonIndex].hp = event.newHP;
        } else {
          this.enemyPokemon.hp = event.newHP;
        }
      });
    }
    isCancellable() {
      return this.battleState !== "SELECTING_FIRST_POKEMON" && this.battleState !== "SELECTING_REQUIRED_SWITCH";
    }
    handleDeploy(event) {
      return __async(this, null, function* () {
        let pokemon;
        if (event.playerName === this.getUser()) {
          this.user.activePokemonIndex = event.pokemonIndex;
          this.userPokemon = this.user.team[event.pokemonIndex];
          pokemon = this.user.team[event.pokemonIndex];
        } else {
          this.enemy.activePokemonIndex = event.pokemonIndex;
          this.enemyPokemon = this.enemy.team[event.pokemonIndex];
          pokemon = this.enemy.team[event.pokemonIndex];
        }
        const cry = getCry(pokemon);
        playCry(cry);
        yield this.$controller.publish({
          type: "DEPLOY_ANIMATION",
          playerName: event.playerName
        });
      });
    }
    handlePPChange(event) {
      if (event.playerName === this.getUser()) {
        this.user.team[event.pokemonIndex].moves[event.moveIndex].pp = event.newPP;
      } else {
        this.enemy.team[event.pokemonIndex].moves[event.moveIndex].pp = event.newPP;
      }
    }
    handleStatusChange(event) {
      if (event.playerName === this.getUser()) {
        this.userPokemon.nonVolatileStatusCondition = event.newStatus || void 0;
        this.user.team[this.user.activePokemonIndex].nonVolatileStatusCondition = event.newStatus || void 0;
      } else {
        this.enemyPokemon.nonVolatileStatusCondition = event.newStatus || void 0;
      }
    }
    handleBindChange(event) {
      if (event.playerName === this.getUser()) {
        this.userPokemon.bindingMoveName = event.newBindingMoveName;
      }
    }
    handleTransform(event) {
      return __async(this, null, function* () {
        if (event.playerName === this.getUser()) {
          yield this.doTransformAnimation(this.userAnimationContext);
          this.user = event.newPlayer;
          this.userPokemon = event.newPokemon;
          this.userAnimationContext.transformAnimationState = "normal";
        } else {
          yield this.doTransformAnimation(this.enemyAnimationContext);
          this.enemy = event.newPlayer;
          this.enemyPokemon = event.newPokemon;
          this.enemyAnimationContext.transformAnimationState = "normal";
        }
      });
    }
    handleTransformStanceChange(event) {
      return __async(this, null, function* () {
        if (event.player.name === this.getUser()) {
          this.user = event.player;
          this.userPokemon = event.newPokemon;
        } else {
          this.enemy = event.player;
          this.enemyPokemon = event.newPokemon;
        }
        yield sleep(500);
      });
    }
    doTransformAnimation(animationContext) {
      return __async(this, null, function* () {
        const states = getTransformAnimationSequence();
        let i = 0;
        const animation = () => {
          animationContext.transformAnimationState = states[i];
          i++;
        };
        const whileCondition = () => i < states.length;
        const speed = 100;
        yield playAnimation(animation, whileCondition, speed);
      });
    }
    handleFaint(event) {
      return __async(this, null, function* () {
        playFaintSound();
        yield this.$controller.publish({
          type: "FAINT_ANIMATION",
          playerName: event.playerName
        });
      });
    }
    selectQuit() {
      return __async(this, null, function* () {
        yield postPlayerAction(this.props.battle.battleId, {
          type: "PLAYER_ACTION",
          playerName: getUserName(),
          details: {
            type: "QUIT_BATTLE"
          }
        });
        this.$router.goTo("/");
      });
    }
  };

  // src/client/battle-loop-handler.ts
  var BattleLoopHandler = class {
    constructor(battleId, controller) {
      this.eventCursor = 0;
      this.running = true;
      this.battleId = battleId;
      this.controller = controller;
    }
    start(initialBattle) {
      return __async(this, null, function* () {
        this.eventCursor = initialBattle.events.length;
        this.handlePlayerAction = this.handlePlayerAction.bind(this);
        this.controller.subscribe("PLAYER_ACTION", this.handlePlayerAction);
        this.controller.subscribe("REMATCH_CREATED", this.handleRematchCreated);
        yield sleep(100);
        yield this.process(initialBattle);
      });
    }
    stop() {
      this.running = false;
      this.controller.unsubscribe("PLAYER_ACTION", this.handlePlayerAction);
      this.controller.unsubscribe("REMATCH_CREATED", this.handleRematchCreated);
    }
    handleRematchCreated(event) {
      return __async(this, null, function* () {
        window.location.href = `/battle/${event.newBattleId}`;
      });
    }
    handlePlayerAction(event) {
      return __async(this, null, function* () {
        logDebug("Handling player action");
        try {
          yield this.controller.publish({
            type: "CLIENT_STATE_CHANGE",
            newState: "SENDING_PLAYER_ACTION"
          });
          let battle = yield postPlayerAction(this.battleId, event);
          if (this.hasNewEvents(battle)) {
            yield this.controller.publish({
              type: "CLIENT_STATE_CHANGE",
              newState: "PLAYING_ANIMATIONS"
            });
          } else {
            yield this.controller.publish({
              type: "CLIENT_STATE_CHANGE",
              newState: "WAITING"
            });
            yield this.controller.publish({
              type: "DISPLAY_MESSAGE",
              message: "Waiting for other player..."
            });
          }
          yield this.pollForNewEvents(battle);
        } catch (e) {
          clientError(e);
        }
      });
    }
    pollForNewEvents(battle) {
      return __async(this, null, function* () {
        let hasNewEvents = false;
        while (!hasNewEvents && this.running) {
          if (this.hasNewEvents(battle)) {
            logDebug("Received new battle events");
            hasNewEvents = true;
            yield this.process(battle);
            if (battle.battleState === "SELECTING_REQUIRED_SWITCH" && !battle.requiredToSwitch.includes(getUserName())) {
              hasNewEvents = false;
            }
          } else {
            logDebug("Polling...");
            yield sleep(2e3);
            battle = yield getBattle(this.battleId);
          }
        }
      });
    }
    hasNewEvents(battle) {
      return battle.events.length > this.eventCursor;
    }
    process(battle) {
      return __async(this, null, function* () {
        var _a;
        this.controller.publish({
          type: "BATTLE_STATE_CHANGE",
          newState: battle.battleState
        });
        const newEvents = battle.events.slice(this.eventCursor, battle.events.length);
        for (const event of newEvents) {
          yield this.controller.publish(event);
        }
        this.eventCursor = battle.events.length;
        const { user, enemy } = getPlayers(battle);
        if (battle.battleState === "GAME_OVER") {
        } else if (battle.battleState === "SELECTING_TEAM") {
        } else if (((_a = battle.pendingPlayerAction) == null ? void 0 : _a.playerName) === getUserName() || battle.battleState === "SELECTING_REQUIRED_SWITCH" && !battle.requiredToSwitch.includes(getUserName())) {
          yield this.controller.publish({
            type: "CLIENT_STATE_CHANGE",
            newState: "WAITING"
          });
          yield this.controller.publish({
            type: "DISPLAY_MESSAGE",
            message: "Waiting for other player..."
          });
        } else if (battle.battleState === "SELECTING_FIRST_POKEMON") {
          yield sleep(500);
          yield this.controller.publish({
            type: "DISPLAY_MESSAGE",
            message: `${enemy.name} has challenged you to a battle!`
          });
          yield this.controller.publish({
            type: "CLIENT_STATE_CHANGE",
            newState: "SELECTING_POKEMON"
          });
          yield this.controller.publish({
            type: "DISPLAY_MESSAGE",
            message: `Who will go out first?`
          });
        } else if (battle.battleState === "SELECTING_REQUIRED_SWITCH") {
          yield this.controller.publish({
            type: "CLIENT_STATE_CHANGE",
            newState: "SELECTING_POKEMON"
          });
          yield this.controller.publish({
            type: "DISPLAY_MESSAGE",
            message: `Who will go out next?`
          });
        } else {
          yield this.controller.publish({
            type: "CLIENT_STATE_CHANGE",
            newState: "SELECTING_ACTION"
          });
          yield this.controller.publish({
            type: "DISPLAY_MESSAGE",
            message: `What will ${user.team[user.activePokemonIndex].name} do?`
          });
        }
      });
    }
  };

  // src/model/avatar.ts
  var avatarList = [
    { desc: "Blackbelt", file: "blackbelt", name: "Blackbelt Kenji" },
    { desc: "Boarder", file: "boarder", name: "Boarder Tom" },
    { desc: "Bug Catcher", file: "bugcatcher", name: "Bug Catcher Joey" },
    { desc: "Beauty", file: "beauty-gen7", name: "Beauty Cassie" },
    { desc: "Biker", file: "biker", name: "Biker Zeke" },
    { desc: "Dancer", file: "dancer", name: "Dancer Floyd" },
    { desc: "Guitarist", file: "guitarist", name: "Guitarist Leah" },
    { desc: "Kimono Girl", file: "kimonogirl", name: "Kimono Girl Naoko" },
    { desc: "Lady", file: "lady", name: "Lady Florence" },
    { desc: "Pokemaniac", file: "pokemaniac", name: "Pokemaniac Kaleb" },
    { desc: "Psychic", file: "psychicf", name: "Psychic Martha" },
    { desc: "Scientist", file: "scientistf", name: "Scientist Hannah" },
    { desc: "Sightseer", file: "sightseer", name: "Sightseer Rebecca" },
    { desc: "Smasher", file: "smasher", name: "Smasher Holly" },
    { desc: "Supernerd", file: "supernerd", name: "Supernerd James" },
    { desc: "Youngster", file: "youngster", name: "Youngster Nick" },
    { desc: "Linebacker", file: "linebacker", name: "Linebacker Gus" },
    { desc: "Ace Trainer", file: "acetrainer-gen4", name: "Ace Trainer Blake" },
    { desc: "Musician", file: "musician", name: "Musician Charles" },
    { desc: "Nurse", file: "nurse", name: "Nurse Carol" },
    { desc: "Battle Girl", file: "battlegirl", name: "Battle Girl Kate" },
    { desc: "Sage", file: "sage", name: "Sage Troy" },
    { desc: "Office Worker", file: "officeworker", name: "Office Worker Edmond" },
    { desc: "Burglar", file: "burglar", name: "Burglar Simon" },
    { desc: "Worker", file: "worker", name: "Worker Robert" },
    { desc: "Medium", file: "medium", name: "Medium Edith" },
    { desc: "Firebreather", file: "firebreather", name: "Firebreather Cliff" }
  ];
  var npcOnlyAvatarList = [
    { desc: "Evelyn", file: "evelyn" },
    { desc: "Wulfric", file: "wulfric" },
    { desc: "Riley", file: "riley" },
    { desc: "Brawly", file: "brawly" },
    { desc: "Bruno", file: "bruno-gen3" },
    { desc: "Lance", file: "lance" },
    { desc: "Lenora", file: "lenora" },
    { desc: "Yellow", file: "yellow" },
    { desc: "Falkner", file: "falkner" },
    { desc: "Li", file: "li" },
    { desc: "Kiawe", file: "kiawe" },
    { desc: "Koga", file: "koga" },
    { desc: "Kukui", file: "kukui" },
    { desc: "Zinnia", file: "zinnia" },
    { desc: "Whitney", file: "whitney" },
    { desc: "Selene", file: "selene" },
    { desc: "Cynthia", file: "cynthia" },
    { desc: "Juan", file: "juan" },
    { desc: "Kahili", file: "kahili" },
    { desc: "Wikstrom", file: "wikstrom" },
    { desc: "Jupiter", file: "jupiter" },
    { desc: "Morty", file: "morty" },
    { desc: "Chuck", file: "chuck" },
    { desc: "Wake", file: "crasherwake" },
    { desc: "Volkner", file: "volkner" },
    { desc: "Flannery", file: "flannery" },
    { desc: "Caitlin", file: "caitlin" },
    { desc: "Colress", file: "colress" },
    { desc: "Alder", file: "alder" },
    { desc: "Ethan", file: "ethan" },
    { desc: "Erika", file: "erika" },
    { desc: "Zinzolin", file: "zinzolin" },
    { desc: "Sabrina", file: "sabrina" },
    { desc: "Jasmine", file: "jasmine" },
    { desc: "Blaine", file: "blaine" },
    { desc: "Ash", file: "ash" },
    { desc: "Misty", file: "misty" },
    { desc: "Brock", file: "brock" },
    { desc: "Xerosic", file: "xerosic" },
    { desc: "Winona", file: "winona" },
    { desc: "Bugsy", file: "bugsy" },
    { desc: "AZ", file: "az" },
    { desc: "Clair", file: "clair" },
    { desc: "Olympia", file: "olympia" },
    { desc: "Lusamine", file: "lusamine" },
    { desc: "Bellelba", file: "bellelba" },
    { desc: "Marshal", file: "marshal" },
    { desc: "Giovanni", file: "giovanni" },
    { desc: "Pokemon Breeder", file: "pokemonbreeder", name: "Pokemon Breeder Carly" },
    { desc: "Pilot", file: "pilot", name: "Pilot Roger" },
    { desc: "Lass", file: "lass", name: "Lass Michelle" },
    { desc: "Skier", file: "skier", name: "Skier Alex" },
    { desc: "Galactic Grunt", file: "galacticgrunt" },
    { desc: "Backpacker", file: "backpacker", name: "Backpacker Nick" },
    { desc: "Janine", file: "janine" },
    { desc: "Fisherman", file: "fisherman", name: "Fisherman George" },
    { desc: "Byron", file: "byron" },
    { desc: "Pokekid", file: "pokekid", name: "Pokekid Annika" },
    { desc: "Red", file: "red-gen7" },
    { desc: "Blue", file: "blue" },
    { desc: "Hilda", file: "hilda" },
    { desc: "Lucas", file: "lucas" },
    { desc: "Olivia", file: "olivia" },
    { desc: "Aaron", file: "aaron" },
    { desc: "Bird Keeper", file: "birdkeeper", name: "Bird Keeper Nico" },
    { desc: "Giovanni", file: "giovanni" },
    { desc: "Lt. Surge", file: "ltsurge" },
    { desc: "Ghetsis", file: "ghetsis" },
    { desc: "Plasma Grunt", file: "plasmagrunt" },
    { desc: "Rocket Grunt", file: "teamrocketgruntm-gen3" },
    { desc: "Aqua Grunt", file: "teamaquagruntm-gen3" },
    { desc: "Magma Grunt", file: "teammagmagruntm-gen3" },
    { desc: "Valerie", file: "valerie" },
    { desc: "Pokefan", file: "pokefan", name: "Pokefan Colton" },
    { desc: "Madame", file: "madame", name: "Madame Cheri" },
    { desc: "Waitress", file: "waitress", name: "Waitress Sally" }
  ];
  var allAvatars = [
    ...avatarList,
    ...npcOnlyAvatarList
  ];

  // src/client/preload-images.ts
  function preloadImages(imageUrls) {
    imageUrls.forEach((url) => {
      new Image().src = url;
    });
  }
  function preloadMiscImages() {
    const startTime = performance.now();
    preloadImages([
      "/img/category-phsyical.png",
      "/img/category-special.png",
      "/img/category-status.png"
    ]);
    const miscTime = performance.now() - startTime;
    logInfo(`Cached misc images in ${miscTime} millis`);
  }
  function preloadPokemonSprites() {
    const startTime = performance.now();
    preloadImages(speciesList.map((s) => `/sprites/front/${getSpriteName(s)}.png`));
    preloadImages(speciesList.map((s) => `/sprites/back/${getSpriteName(s)}.png`));
    preloadImages(speciesList.map((s) => `/sprites/front-ani/${getSpriteName(s)}.gif`));
    preloadImages(speciesList.map((s) => `/sprites/back-ani/${getSpriteName(s)}.gif`));
    const time = performance.now() - startTime;
    logInfo(`Cached Pokemon images in ${time} millis`);
  }
  function preloadTrainerSprites() {
    const startTime = performance.now();
    preloadImages(allAvatars.map((avatar) => `/sprites/trainers/${avatar.file}.png`));
    const time = performance.now() - startTime;
    logInfo(`Cached trainer images in ${time} millis`);
  }

  // src/client/preload-audio.ts
  function preloadAudio() {
    var audio = new Audio();
    const startTime = performance.now();
    for (const file of miscAudioFiles) {
      audio.src = `/${AUDIO_FOLDER}/${file}`;
    }
    const miscTime = performance.now() - startTime;
    logInfo(`Cached misc audio in ${miscTime} millis`);
    for (const file of moveAudioFiles) {
      audio.src = `/${AUDIO_FOLDER}/moves/${file}`;
    }
    const movesTime = performance.now() - miscTime;
    logInfo(`Cached move audio in ${movesTime} millis`);
    for (const pokemon of speciesList) {
      const cry = getCry(pokemon);
      audio.src = `/${AUDIO_FOLDER}/${cry}`;
    }
    const cryTime = performance.now() - movesTime;
    logInfo(`Cached cry audio in ${cryTime} millis`);
  }

  // src/client/battle-loader-component.ts
  var BattleLoaderComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.started = false;
      this.unlockedPokemonSpecies = [];
      this.template = `
    <div style="max-width: 500px;" class="font-mono mx-auto">
      <battle-component $if="started" :battle="battle" :unlocked_species="unlockedPokemonSpecies"></battle-component>
    </div>
  `;
      this.includes = {
        BattleComponent
      };
      preloadPokemonSprites();
      preloadTrainerSprites();
      preloadAudio();
    }
    beforeMount() {
      return __async(this, null, function* () {
        const user = yield getUser();
        let battle;
        try {
          battle = yield getBattle(this.props.routeParams.battleId);
        } catch (error) {
          this.$router.goTo("/");
        }
        this.battle = battle;
        this.unlockedPokemonSpecies = getUnlockedSpecies(user.unlockedPokemon, user.isAdmin);
        const battleLoopHandler = new BattleLoopHandler(battle.battleId, this.$controller);
        battleLoopHandler.start(battle);
        this.started = true;
        this.beforeUnmount = () => {
          battleLoopHandler.stop();
        };
      });
    }
  };

  // src/client/main-menu-component.ts
  var MainMenuComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.loading = true;
      this.loggedIn = false;
      this.template = `
    <div class="main-menu">
      <div class="container mx-auto px-4">
        <img class="h-28 mx-auto mt-10" src="/img/pokemon_logo.png" alt="pokemon"/>
        <h1 class="text-center text-2xl mt-8 px-4">
          BATTLE ARENA
        </h1>
        <div $if="!loading" class="mt-10">
          <div $if="nestedRoute('/')">
            <main-menu-button-component text="PLAY" route="/play"></main-menu-button-component>
            <main-menu-button-component text="POKEDEX" route="/pokedex"></main-menu-button-component>
            <main-menu-button-component $if="!loggedIn" text="LOG IN" route="/login"></main-menu-button-component>
            <main-menu-button-component $if="loggedIn" text="SETTINGS" route="/settings"></main-menu-button-component>
          </div>
          <div $if="nestedRoute('/play')">
            <main-menu-button-component text="SINGLE PLAYER" :action="selectSinglePlayer"></main-menu-button-component>
            <main-menu-button-component text="MULTI PLAYER" route="/multiplayer"></main-menu-button-component>
            <main-menu-button-component text="CANCEL" route="/"></main-menu-button-component>
          </div>
          <div $if="nestedRoute('/singleplayer')">
            <main-menu-button-component text="ARENA" :action="selectArena"></main-menu-button-component>
            <main-menu-button-component text="LEAGUE" route="/league"></main-menu-button-component>
            <main-menu-button-component text="PRACTICE" :action="selectPractice"></main-menu-button-component>
            <main-menu-button-component text="CANCEL" route="/"></main-menu-button-component>
          </div>
          <div $if="nestedRoute('/multiplayer')">
            <!--<main-menu-button-component text="RESUME" route="/multiplayer/resume"></main-menu-button-component>-->
            <main-menu-button-component text="CHALLENGE" :action="createChallenge"></main-menu-button-component>
            <main-menu-button-component text="CANCEL" route="/"></main-menu-button-component>
          </div>
          <multi-player-resume-component $if="nestedRoute('/multiplayer/resume')">
          </multi-player-resume-component>
        </div>
      </div>
    </div>
  `;
      this.includes = {
        MainMenuButtonComponent,
        MultiPlayerResumeComponent
      };
      preloadMiscImages();
    }
    beforeMount() {
      return __async(this, null, function* () {
        const user = yield tryToGetUser();
        if (user) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
        this.loading = false;
      });
    }
    nestedRoute(route) {
      return window.location.pathname === route;
    }
    selectSinglePlayer() {
      return __async(this, null, function* () {
        const user = yield getUser();
        if (user.singlePlayerBattleId) {
          this.$router.goTo(`/battle/${user.singlePlayerBattleId}`);
        } else {
          this.$router.goTo(`/singleplayer`);
        }
      });
    }
    selectArena() {
      return __async(this, null, function* () {
        const user = yield getUser();
        if (user.singlePlayerBattleId) {
          this.$router.goTo(`/battle/${user.singlePlayerBattleId}`);
        } else {
          const createBattleRequest = {
            battleType: "SINGLE_PLAYER",
            battleSubType: "ARENA"
          };
          const battle = yield postBattle(createBattleRequest);
          this.$router.goTo(`/battle/${battle.battleId}`);
        }
      });
    }
    selectPractice() {
      return __async(this, null, function* () {
        const user = yield getUser();
        if (user.singlePlayerBattleId) {
          this.$router.goTo(`/battle/${user.singlePlayerBattleId}`);
        } else {
          const createBattleRequest = {
            battleType: "SINGLE_PLAYER",
            battleSubType: "PRACTICE"
          };
          const battle = yield postBattle(createBattleRequest);
          this.$router.goTo(`/battle/${battle.battleId}`);
        }
      });
    }
    createChallenge() {
      return __async(this, null, function* () {
        yield getUser();
        const challenge = yield postChallengeRequest();
        this.$router.goTo(`/challenge/${challenge.challengeId}`);
      });
    }
  };
  var MultiPlayerResumeComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.battles = [];
      this.template = `
    <ul>
      <li $for="battle in battles">
        <a href="/battle/{{battle}}">{{battle}}</a>
      </li>
    </ul>
  `;
    }
    beforeMount() {
      return __async(this, null, function* () {
        const user = yield getUser();
        this.battles = user.multiPlayerBattleIds;
      });
    }
  };
  var MainMenuButtonComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="flex flex-row justify-center mt-6">
      <button @click="props.action || handleClick" class="w-72 h-14 rounded-lg bg-red-500 border border-black py-3 px-8 text-white">
        {{props.text}}
      </button>
    </div>
  `;
    }
    handleClick() {
      if (this.props.route) {
        this.$router.goTo(this.props.route);
      }
    }
  };

  // src/data/default-pokemon-data.ts
  var defaultUnlockedPokemon = [
    3,
    6,
    9,
    12,
    15,
    18,
    20,
    24,
    27,
    31,
    34,
    36,
    38,
    51,
    53,
    59,
    65,
    68,
    71,
    76,
    80,
    82,
    91,
    94,
    95,
    97,
    99,
    101,
    103,
    106,
    107,
    110,
    112,
    113,
    115,
    121,
    122,
    123,
    127,
    130,
    131,
    132,
    134,
    135,
    136,
    141,
    142,
    143,
    144,
    145,
    146,
    149,
    150,
    151
  ];

  // src/client/pokemon-list-component.ts
  var PokemonListComponent = class extends BaseComponent {
    constructor() {
      super({});
      this.speciesList = [];
      this.totalCount = 0;
      this.unlockedCount = 0;
      this.moveInModal = null;
      this.template = `
    <div class="container mx-auto font-mono">
      <modal-component $if="moveInModal" :close="closeMoveModal">
        <div style="max-width: 300px;" class="bg-white p-5 mx-auto">
          <move-card-component :move="moveInModal"></move-card-component>
        </div>
      </modal-component>
      <h1 class="main-menu text-center text-2xl mt-8 px-4">
        POKEDEX
      </h1>
      <div class="flex flex-row">
        <a class="main-menu mx-auto my-8 px-4" href="/">
          Home
        </a>
      </div>
      <div $if="unlockedCount && unlockedCount">
        <div class="flex flex-row justify-center mb-3">
          <h2 class="text-lg">{{unlockedCount}} / {{totalCount}} Pok\xE9mon unlocked</h2>
        </div>
        <progress-bar-component :percent="getPercentUnlocked()">
      </div>
      </progress-bar-component>
      <div class="mt-10 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div $for="species in speciesList" class="bg-white rounded-xl px-5 pt-5 mx-auto md:mx-3 my-3" style="max-width: 300px;">
          <pokemon-card-component :species="species" :click_move="openMoveModal"></pokemon-card-component>
          <br>
        </div>
      </div>
    </div>
  `;
      this.includes = {
        PokemonCardComponent,
        ProgressBarComponent,
        MoveCardComponent
      };
      preloadPokemonSprites();
    }
    afterMount() {
      return __async(this, null, function* () {
        let unlockedPokemon = defaultUnlockedPokemon;
        const user = yield tryToGetUser();
        if (user) {
          unlockedPokemon = user.unlockedPokemon;
        }
        this.speciesList = getUnlockedSpecies(unlockedPokemon, user == null ? void 0 : user.isAdmin).sort((a, b) => {
          return a.pokedexNumber - b.pokedexNumber;
        });
        this.unlockedCount = unlockedPokemon.length;
        this.totalCount = speciesList.length;
      });
    }
    getPercentUnlocked() {
      if (this.unlockedCount && this.totalCount) {
        return Math.floor(this.unlockedCount / this.totalCount * 100);
      } else {
        return 0;
      }
    }
    openMoveModal(move) {
      this.moveInModal = move;
    }
    closeMoveModal() {
      this.moveInModal = null;
    }
  };
  var ProgressBarComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="flex flex-row justify-end items-center h-4">
      <div class="w-full h-2 mb-3 mx-8">
        <div class="rounded-lg h-8 bg-gray-600">
          <div style="width: {{props.percent}}%;" class="rounded-l-lg h-8 bg-green-300"></div>
        </div>
      </div>
    </div>
  `;
    }
  };

  // src/util/url-utils.ts
  function getRequestParam(param) {
    return new URL(document.location.toString()).searchParams.get(param);
  }

  // src/client/login-component.ts
  var LoginComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.username = "";
      this.password = "";
      this.template = `
    <div class="container mx-auto px-4" style="max-width: 500px;">
      <div class="mx-auto">
        <form @submit="(e)=>{e.preventDefault(); sendLoginRequest();}" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-3">
          <input type="submit" style="display: none" />
          <h1 class="mt-6 mb-6 text-center text-3xl font-extrabold text-gray-900">
            Log In
          </h1>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
              Username
            </label>
            <input $bind="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Password
            </label>
            <input $bind="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password">
            <p class="text-lg ml-1 my-6">Need an account? <a href="/signup{{window.location.search}}" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Sign Up</a></p>
          </div>
          <div class="flex items-center justify-center">
            <button @click="sendLoginRequest" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Log In
            </button>
            <button @click="()=>$router.goTo('/')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
    }
    sendLoginRequest() {
      return __async(this, null, function* () {
        yield postLoginRequest({
          username: this.username,
          password: this.password
        });
        let redirectedFrom = getRequestParam("from");
        document.location.search = "";
        if (redirectedFrom) {
          this.$router.goTo(redirectedFrom);
        } else {
          this.$router.goTo("/");
        }
      });
    }
  };

  // src/model/signup-validation.ts
  function validateUsername(username) {
    if (!username || username.trim().length < 3) {
      return {
        isValid: false,
        errorText: "Username must be at least 3 characters"
      };
    }
    if (username.length > 15) {
      return {
        isValid: false,
        errorText: "Username must be less than or equal to 15 characters"
      };
    }
    if (containsInvalidCharacters(username)) {
      return {
        isValid: false,
        errorText: "Username contains invalid characters"
      };
    }
    return {
      isValid: true,
      errorText: ""
    };
  }
  function validatePassword(password) {
    if (!password || password.trim().length < 3) {
      return {
        isValid: false,
        errorText: "Password must be at least 3 characters"
      };
    }
    if (containsInvalidCharacters(password)) {
      return {
        isValid: false,
        errorText: "Password contains invalid characters"
      };
    }
    return {
      isValid: true,
      errorText: ""
    };
  }
  function containsInvalidCharacters(text) {
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) > 127) {
        return true;
      }
    }
    return false;
  }

  // src/client/signup-component.ts
  var avatarOptions = avatarList.sort((a, b) => a.desc.localeCompare(b.desc));
  avatarOptions.unshift({
    desc: "",
    file: ""
  });
  var SignupComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.username = "";
      this.password = "";
      this.avatar = "";
      this.soundEffects = true;
      this.music = true;
      this.avatarOptions = avatarOptions;
      this.template = `
    <div class="container mx-auto px-4" style="max-width: 500px;">
      <div class="mx-auto">
        <form @submit="(e)=>{e.preventDefault(); sendSignupRequest();}" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-3">
          <input type="submit" style="display: none" />
          <h1 class="mt-6 mb-6 text-center text-3xl font-extrabold text-gray-900">
            Sign Up
          </h1>
          <div class="mt-5 mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
              Username
            </label>
            <input $bind="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Password
            </label>
            <input $bind="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password">
          </div>
          <div id="avatar-display" class="mt-11">
            <img class="h-28 mx-auto" src="/sprites/trainers/{{avatar ? avatar.toLowerCase() : 'unknown'}}.png">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Avatar
            </label>
            <select $bind="avatar" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="avatar">
              <option $for="option in avatarOptions" :value="option.file">{{option.desc}}</option>
            </select>
          </div>
          <div class="mb-6 flex flex-row justify-around">
            <div>
              <label class="text-gray-700 text-sm font-bold mb-2 mr-2" for="music">
                Music
              </label>
              <input $bind="music" type="checkbox" class="" id="music">
            </div>
            <div>
              <label class="text-gray-700 text-sm font-bold mb-2 mr-2" for="sound_effects">
                Sound Effects
              </label>
              <input $bind="soundEffects" type="checkbox" class="" id="sound_effects">
            </div>
          </div>
          <p class="text-lg ml-1 my-6">Already have an account? <a href="/login{{window.location.search}}" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Log In</a></p>
          <div class="flex items-center justify-center">
            <button @click="sendSignupRequest" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Sign Up
            </button>
            <button @click="()=>$router.goTo('/')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
    }
    sendSignupRequest() {
      return __async(this, null, function* () {
        const usernameValidationResult = validateUsername(this.username);
        const passwordValidationResult = validatePassword(this.password);
        if (!usernameValidationResult.isValid) {
          alert(usernameValidationResult.errorText);
        } else if (!passwordValidationResult.isValid) {
          alert(passwordValidationResult.errorText);
        } else if (!this.avatar) {
          alert("Please select an avatar");
        } else {
          const existingUser = yield tryToGetExistingUser(this.username);
          if (!existingUser) {
            yield postSignupRequest({
              username: this.username,
              password: this.password,
              avatar: this.avatar,
              music: this.music,
              soundEffects: this.soundEffects
            });
            let redirectedFrom = getRequestParam("from");
            document.location.search = "";
            if (redirectedFrom) {
              this.$router.goTo(redirectedFrom);
            } else {
              this.$router.goTo("/");
            }
          } else {
            alert(`Username is already taken.`);
          }
        }
      });
    }
  };

  // src/util/poller.ts
  var Poller = class {
    constructor() {
      this.schedule = [
        1,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        3,
        3,
        5,
        5,
        5,
        5,
        5,
        10
      ];
    }
    run() {
      return __async(this, null, function* () {
        if (!this.action) {
          throw new Error("No action defined");
        }
        if (!this.endCondition) {
          throw new Error("No endCondition defined");
        }
        logDebug("Starting polling loop");
        let scheduleIndex = 0;
        let polling = true;
        while (polling) {
          yield this.action();
          const done = yield this.endCondition();
          if (!done) {
            const sleepTimeInSeconds = this.schedule.length > scheduleIndex ? this.schedule[scheduleIndex] : this.schedule[this.schedule.length - 1];
            yield sleep(sleepTimeInSeconds * 1e3);
            scheduleIndex++;
          } else {
            polling = false;
          }
        }
      });
    }
  };

  // src/client/challenge-component.ts
  var ChallengeComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.view = "LOADING";
      this.showCopiedMsg = false;
      this.template = `
    <div class="py-3 font-mono container mx-auto px-4" style="max-width: 500px">

      <div $if="view == 'RECEIVER'">
        <img class="h-28 mx-auto mt-10" src="/img/pokemon_logo.png" alt="pokemon"/>
        <h1 class="main-menu text-center text-2xl mt-8 px-4">
          BATTLE ARENA
        </h1>
        <div id="avatar-display" class="mt-5 mb-8">
          <img class="h-32 mx-auto" src="/sprites/trainers/{{challenge.challengerAvatar.toLowerCase()}}.png">
        </div>
        <terminal-component></terminal-component>
        <div class="grid grid-cols-2 gap-1">
          <div @click="acceptChallenge" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
            Accept
          </div>
          <div @click="rejectChallenge" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
            Reject
          </div>
        </div>
      </div>


      <div $if="view == 'CHALLENGER'">
        <h1 class="text-center text-xl m-2">CHALLENGE A FRIEND</h1>
        <h2 class="text-center text-lg mt-5 cursor-pointer">Challenge ID: {{props.routeParams.challengeId}}</h2>
        <p class="text-center mt-5">Send this URL to a friend to challenge them to a Pokemon battle!</p>
        <p class="text-center mt-5">You can click the URL below to copy it to your clipboard:</p>
        <p class="text-center cursor-pointer text-blue-600" @click="copyUrl">{{url}}</p>
        <p $if="showCopiedMsg" class="text-center">Copied!</p>
        <p class="text-center mt-5">After they accept this page will reload and start the battle automatically.</p>
      </div>

    </div>
  `;
      this.includes = {
        TerminalComponent
      };
    }
    beforeMount() {
      return __async(this, null, function* () {
        var _a;
        const loggedInUser = yield tryToGetUser();
        const challengeId = this.props.routeParams.challengeId;
        if (challengeId) {
          this.url = document.location.href;
          this.challenge = yield getChallenge(challengeId);
          if (loggedInUser && this.challenge.challengerName === loggedInUser.username) {
            this.view = "CHALLENGER";
            this.poll();
          } else {
            this.view = "RECEIVER";
            yield this.$controller.publish({
              type: "DISPLAY_MESSAGE",
              message: `${(_a = this.challenge) == null ? void 0 : _a.challengerName} challenged you to a Pokemon battle!`
            });
          }
        } else {
          this.$router.goTo("/");
        }
      });
    }
    poll() {
      return __async(this, null, function* () {
        if (this.challenge) {
          const poller = new Poller();
          poller.action = () => __async(this, null, function* () {
            this.challenge = yield getChallenge(this.challenge.challengeId);
          });
          poller.endCondition = () => __async(this, null, function* () {
            var _a;
            return ((_a = this.challenge) == null ? void 0 : _a.state) === "ACCEPTED";
          });
          yield poller.run();
          this.$router.goTo(`/battle/${this.challenge.battleId}`);
        }
      });
    }
    acceptChallenge() {
      return __async(this, null, function* () {
        const challengeId = this.props.routeParams.challengeId;
        if (challengeId) {
          const challenge = yield postChallengeAccept(challengeId);
          if (challenge.battleId) {
            this.$router.goTo(`/battle/${challenge.battleId}`);
          } else {
            alert("Failed to accept challenge");
            logInfo("Failed to accept challenge, no battleId");
            logInfo(challenge);
          }
        }
      });
    }
    rejectChallenge() {
      this.$router.goTo("/");
    }
    copyUrl() {
      var dummy = document.createElement("input"), text = window.location.href;
      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      this.showCopiedMsg = true;
    }
  };

  // src/client/pokemon-table-component.ts
  var PokemonTableComponent = class extends BaseComponent {
    constructor() {
      super({});
      this.speciesList = [];
      this.template = `
      <div class="flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border-b border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-blue-900 text-white">
                  <tr>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Pokemon
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      HP
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Atk
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Sp Atk
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Def
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Sp Def
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Speed
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Move 1
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Move 2
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Move 3
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Move 4
                    </th>
                  </tr>
                </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr $for="pokemon, i in speciesList" class="{{getStripe(i)}}">
                      <td class="px-6 py-3 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10">
                            <img class="transform scale-150 mr-2" src="/sprites/front/{{getSprite(pokemon)}}.png" alt:="pokemon.name" />
                          </div>
                        <div class="ml-4">
                          <div class="text-lg font-medium text-gray-900">
                            {{pokemon.name}}
                          </div>
                          <types-row :types="pokemon.types"></types-row>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm font-medium">
                      {{pokemon.hp + pokemon.attack + pokemon.defense + pokemon.specialAttack + pokemon.specialDefense + pokemon.speed}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.hp}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.attack}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.specialAttack}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.defense}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.specialDefense}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.speed}}
                    </td>
                    <td $for="move in pokemon.moves" class="px-6 py-3 whitespace-nowrap">
                      <div class="flex items-center">
                        <div $if="move.name">
                          <div class="text-sm font-medium">
                            {{move.name}}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{move.power || ''}} {{move.type}} {{move.startingPP}} 
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
      this.includes = {
        TypesRow: TypesRow2
      };
      this.speciesList = speciesList.sort((a, b) => {
        return a.pokedexNumber - b.pokedexNumber;
      }).map((species) => {
        const movesToPad = 4 - species.moves.length;
        for (let i = 0; i < movesToPad; i++) {
          species.moves.push({});
        }
        return species;
      });
    }
    getStripe(index) {
      return index % 2 === 0 ? "" : "bg-gray-100";
    }
  };
  var TypesRow2 = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="flex flex-row">
      <type-card-component :type="props.types[0]"></type-card-component>
      <div class="ml-2">
        <type-card-component $if="props.types.length > 1" :type="props.types[1]"></type-card-component>
      </div>
    </div>
  `;
      this.includes = {
        TypeCardComponent
      };
    }
  };

  // src/client/move-table-component.ts
  var MoveTableComponent = class extends BaseComponent {
    constructor() {
      super({});
      this.moveList = [];
      this.template = `
    <div class="flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div class="shadow overflow-hidden border-b border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-blue-900 text-white">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Power
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    PP
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr $for="move, i in moveList" class="{{getStripe(i)}}">
                  
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    <div class="font-medium text-gray-900">
                      {{move.name}}
                    </div>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.type}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.category}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.power || ''}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{Math.floor(move.accuracy * 100)}}%
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.pp}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.priority}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.description}}
                  </td>
                
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
      this.moveList = Array.prototype.map.call(Object.values(moves), (move) => {
        return buildMove(move);
      }).sort((a, b) => {
        return a.type.localeCompare(b.type) || a.category.localeCompare(b.category) || b.power - a.power;
      });
    }
    getStripe(index) {
      return index % 2 === 0 ? "" : "bg-gray-100";
    }
  };

  // src/client/move-list-component.ts
  var MoveListComponent = class extends BaseComponent {
    constructor(props) {
      super(props);
      this.template = `
    <div class="container mx-auto font-mono">
      <h1 class="main-menu text-center text-2xl mt-8 px-4">
        MOVE LIST
      </h1>
      <div class="flex flex-row">
        <a class="main-menu mx-auto my-8 px-4" href="/">
          Home
        </a>
      </div>
      <div class="mt-5 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div $for="move in moveList" class="bg-white rounded-xl p-5 mx-auto md:mx-3 my-3" style="max-width: 300px;">
          <move-card-component :move="move"></move-card-component>
          <br>
        </div>
      </div>
    </div>
  `;
      this.includes = {
        MoveCardComponent
      };
      this.moveList = Array.prototype.map.call(Object.values(moves), (move) => {
        return buildMove(move);
      }).sort((a, b) => {
        return a.type.localeCompare(b.type) || a.category.localeCompare(b.category) || b.power - a.power;
      });
    }
  };

  // src/client/scene-test-component.ts
  var SceneTestComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.names = speciesList.map((s) => s.name);
      this.userPokemonName = localStorage.getItem("sceneTest:user") || "Venusaur";
      this.enemyPokemonName = localStorage.getItem("sceneTest:enemy") || "Charizard";
      this.user = buildPokemon(this.userPokemonName);
      this.user_animation_ctx = defaultAnimationContext();
      this.enemy = buildPokemon(this.enemyPokemonName);
      this.enemy_animation_ctx = defaultAnimationContext();
      this.template = `
    <div style="max-width: 500px;" class="font-mono mx-auto">
      <div class="mt-5 flex flex-row">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
            User
          </label>
          <input $bind="userPokemonName" list="names" class="shadow appearance-none border rounded w-36 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text">
        </div>
        <div class="mb-4 ml-5">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
            Enemy
          </label>
          <input $bind="enemyPokemonName" list="names" class="shadow appearance-none border rounded w-36 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text">
        </div>
        <datalist id="names">
          <option $for="name in names" :value="name"></option>
        </datalist>
      </div>
      <div class="flex flex-row">
        <button @click="update" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
          Update
        </button>
        <button @click="clear" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
          Clear
        </button>
        <button @click="()=>$router.goTo('/')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
          Home
        </button>
      </div>
      <battle-zone-component 
        :user="user" 
        :user_player="{}" 
        :user_animation_ctx="user_animation_ctx"
        :enemy="enemy"
        :enemy_player="{}" 
        :enemy_animation_ctx="enemy_animation_ctx"
      ></battle-zone-component>
    </div>
  `;
      this.includes = {
        BattleZoneComponent
      };
    }
    update() {
      localStorage.setItem("sceneTest:enemy", this.enemyPokemonName);
      if (this.userPokemonName) {
        localStorage.setItem("sceneTest:user", this.userPokemonName);
        this.user = buildPokemon(this.userPokemonName);
      }
      if (this.enemyPokemonName) {
        this.enemy = buildPokemon(this.enemyPokemonName);
      }
    }
    clear() {
      this.userPokemonName = "";
      this.enemyPokemonName = "";
    }
    afterMount() {
      setUserName("foo");
      setTimeout(() => {
        this.$controller.publish({
          type: "TAKE_DAMAGE_ANIMATION",
          playerName: "John",
          directAttack: true
        });
      }, 500);
    }
  };

  // src/client/settings-component.ts
  var avatarOptions2 = avatarList.sort((a, b) => a.desc.localeCompare(b.desc));
  var SettingsComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.avatarOptions = avatarOptions2;
      this.loaded = false;
      this.username = "";
      this.avatar = "";
      this.soundEffects = true;
      this.music = true;
      this.template = `
    <div class="container mx-auto px-4" style="max-width: 500px;">
      <div $if="loaded" class="mx-auto">
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-3">
          <h1 class="mt-6 mb-6 text-center text-3xl font-extrabold text-gray-900">
            Settings for {{username}}
          </h1>
          <div id="avatar-display" class="mt-11">
            <img class="h-28 mx-auto" src="/sprites/trainers/{{avatar ? avatar.toLowerCase() : 'unknown'}}.png">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Avatar
            </label>
            <select $bind="avatar" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="avatar">
              <option $for="option in avatarOptions" :value="option.file">{{option.desc}}</option>
            </select>
          </div>
          <div class="mb-6 flex flex-row justify-around">
            <div>
              <label class="text-gray-700 text-sm font-bold mb-2 mr-2" for="music">
                Music
              </label>
              <input $bind="music" type="checkbox" class="" id="music">
            </div>
            <div>
              <label class="text-gray-700 text-sm font-bold mb-2 mr-2" for="sound_effects">
                Sound Effects
              </label>
              <input $bind="soundEffects" type="checkbox" class="" id="sound_effects">
            </div>
          </div>
          <div class="flex items-center justify-center">
            <button @click="update" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Save
            </button>
            <button @click="()=>$router.goTo('/logout')" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Log Out
            </button>
            <button @click="()=>$router.goTo('/')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
    }
    beforeMount() {
      return __async(this, null, function* () {
        var _a, _b, _c, _d;
        const user = yield getUser();
        this.$update({
          username: user.username,
          avatar: user.avatar,
          soundEffects: (_a = user.settings) == null ? void 0 : _a.soundEffects,
          music: (_b = user.settings) == null ? void 0 : _b.music,
          loaded: true
        });
        this.$update({
          soundEffects: (_c = user.settings) == null ? void 0 : _c.soundEffects,
          music: (_d = user.settings) == null ? void 0 : _d.music
        });
      });
    }
    update() {
      return __async(this, null, function* () {
        yield putUser(this.username, {
          avatar: this.avatar,
          settings: {
            soundEffects: this.soundEffects,
            music: this.music
          }
        });
        this.$router.goTo("/");
      });
    }
  };

  // src/model/league.ts
  function _(speciesName, level, options) {
    var _a;
    const pokemon = buildPokemon(speciesName);
    pokemon.level = level;
    const levelModifier = level - 50;
    pokemon.hp += levelModifier;
    pokemon.startingHP += levelModifier;
    pokemon.attack += levelModifier;
    pokemon.startingAttack += levelModifier;
    pokemon.defense += levelModifier;
    pokemon.startingDefense += levelModifier;
    pokemon.specialAttack += levelModifier;
    pokemon.startingSpecialAttack += levelModifier;
    pokemon.specialDefense += levelModifier;
    pokemon.startingSpecialDefense += levelModifier;
    pokemon.speed += levelModifier;
    pokemon.startingSpeed += levelModifier;
    const oldSpecies = pokemon.species;
    const newSpecies = __spreadProps(__spreadValues({}, oldSpecies), {
      hp: oldSpecies.hp + levelModifier,
      attack: oldSpecies.attack + levelModifier,
      defense: oldSpecies.defense + levelModifier,
      specialAttack: oldSpecies.specialAttack + levelModifier,
      specialDefense: oldSpecies.specialDefense + levelModifier,
      speed: oldSpecies.speed + levelModifier,
      level
    });
    pokemon.species = newSpecies;
    if ((_a = options == null ? void 0 : options.moves) == null ? void 0 : _a.length) {
      pokemon.moves = [];
      pokemon.startingMoves = [];
      for (const moveName of options.moves) {
        const moveDef = moves[moveName];
        const move = buildMove(moveDef);
        pokemon.moves.push(move);
        pokemon.startingMoves.push(move);
      }
    }
    return pokemon;
  }
  var leagueTrainers = [
    {
      name: "Youngster Nick",
      avatar: "youngster",
      leads: [0],
      team: [
        _("Arcanine", 40),
        _("Typhlosion", 46),
        _("Raticate", 30, {
          moves: ["Bite"]
        }),
        _("Pinsir", 32, {
          moves: ["X-Scissor"]
        })
      ],
      rewards: [
        157,
        330
      ]
    },
    {
      name: "Lady Florence",
      avatar: "lady",
      team: [
        _("Flareon", 38),
        _("Vaporeon", 40),
        _("Espeon", 43),
        _("Umbreon", 43)
      ],
      rewards: [
        196,
        197
      ]
    },
    {
      name: "Brock",
      avatar: "brock",
      leads: [1],
      team: [
        _("Steelix", 62),
        _("Onix", 46),
        _("Golem", 36),
        _("Ludicolo", 34, {
          moves: ["Giga Drain", "Hydro Pump"]
        })
      ],
      rewards: [
        208,
        272,
        508,
        212
      ]
    },
    {
      name: "Bugcatcher Wade",
      avatar: "bugcatcher",
      leads: [1, 2],
      team: [
        _("Butterfree", 35, {
          moves: ["Whirlwind", "Confuse Ray", "Sleep Powder", "Air Slash"]
        }),
        _("Galvantula", 43),
        _("Shuckle", 45),
        _("EXPLOUD", 40, {
          moves: ["Roar", "Boomburst"]
        })
      ],
      rewards: [
        596,
        213,
        295,
        241
      ]
    },
    {
      name: "Psychic Martha",
      avatar: "psychicf",
      team: [
        _("Hypno", 46),
        _("Mr. Mime", 43),
        _("Claydol", 40),
        _("GARDEVOIR", 51)
      ],
      rewards: [
        282,
        344,
        227,
        442
      ]
    },
    {
      name: "Pokemaniac Kaleb",
      avatar: "pokemaniac",
      leads: [0],
      team: [
        _("Clefable", 60, {
          moves: ["Metronome"]
        }),
        _("Gengar", 53, {
          moves: ["Metronome"]
        }),
        _("Mew", 57, {
          moves: ["Metronome"]
        }),
        _("Snorlax", 45, {
          moves: ["Metronome"]
        })
      ],
      rewards: [
        78,
        471,
        242,
        184
      ]
    },
    {
      name: "Misty",
      avatar: "misty",
      leads: [3],
      team: [
        _("Starmie", 62),
        _("Togekiss", 57, {
          moves: ["Fire Blast", "Air Slash", "Tri Attack"]
        }),
        _("Gyarados", 54, {
          moves: ["Hurricane", "Thunder", "Earthquake"]
        }),
        _("PELIPPER", 43, {
          moves: ["Hurricane", "Water Pulse", "Roost"]
        })
      ],
      rewards: [
        468,
        279,
        73,
        537
      ]
    },
    {
      name: "Koga",
      avatar: "koga",
      leads: [0, 1],
      team: [
        _("TOXICROAK", 67, {
          moves: ["Toxic Spikes", "Protect", "Brick Break", "Smokescreen"]
        }),
        _("WEEZING", 66, {
          moves: ["Toxic Spikes", "Protect", "Heat Wave", "Smokescreen"]
        }),
        _("Flygon", 65, {
          moves: ["Dragon Tail", "Protect", "Earthquake", "Bug Buzz"]
        }),
        _("SCRAFTY", 55, {
          moves: ["Payback", "Protect", "Brick Break", "Circle Throw"]
        })
      ],
      rewards: [
        454,
        560,
        609,
        62
      ]
    },
    {
      name: "Wulfric",
      avatar: "wulfric",
      leads: [0],
      team: [
        _("Abomasnow", 56),
        _("Cloyster", 50),
        _("Mamoswine", 56),
        _("VANILLUXE", 40)
      ],
      rewards: [
        460,
        584,
        476,
        214
      ]
    },
    {
      name: "Morty",
      avatar: "morty",
      team: [
        _("Dusknoir", 58),
        _("Froslass", 47),
        _("MAWILE", 53),
        _("Sableye", 60)
      ],
      rewards: [
        477,
        478,
        303,
        302
      ]
    },
    {
      name: "Valerie",
      avatar: "valerie",
      team: [
        _("KLEFKI", 55),
        _("MIENSHAO", 56),
        _("CELEBI", 62),
        _("WHIMSICOTT", 51)
      ],
      rewards: [
        707,
        620,
        547,
        251
      ]
    },
    {
      name: "Supernerd James",
      avatar: "supernerd",
      leads: [0, 3],
      team: [
        _("REGISTEEL", 67),
        _("DEOXYS", 67),
        _("ROTOM", 56),
        _("SANDSLASH", 45)
      ],
      rewards: [
        379,
        28,
        479,
        297
      ]
    },
    {
      name: "Sabrina",
      avatar: "sabrina",
      team: [
        _("ALAKAZAM", 76),
        _("ESPEON", 52),
        _("GARDEVOIR", 60),
        _("ABSOL", 60)
      ],
      rewards: [
        359,
        474,
        319,
        169
      ]
    },
    {
      name: "Linebacker Gus",
      avatar: "linebacker",
      team: [
        _("CONKELDURR", 54),
        _("Snorlax", 65),
        _("DARMANITAN", 49),
        _("SEISMITOAD", 46)
      ],
      rewards: [
        534,
        555,
        470,
        323
      ]
    },
    {
      name: "Clair",
      avatar: "clair",
      team: [
        _("SALAMENCE", 70),
        _("GYARADOS", 57),
        _("STEELIX", 60),
        _("REGICE", 65)
      ],
      rewards: [
        373,
        378,
        87,
        237
      ]
    },
    {
      name: "Xerosic",
      avatar: "xerosic",
      leads: [2, 3],
      team: [
        _("HO-OH", 68),
        _("DONPHAN", 42),
        _("SKARMORY", 57),
        _("BRELOOM", 58)
      ],
      rewards: [
        250,
        232,
        286,
        472
      ]
    },
    {
      name: "Ace Trainer Blake",
      avatar: "acetrainer-gen4",
      team: [
        _("HYDREIGON", 63),
        _("AEGISLASH", 60),
        _("DUGTRIO", 60),
        _("PINSIR", 57)
      ],
      rewards: [
        681,
        635,
        492,
        437
      ]
    },
    {
      name: "Lenora",
      avatar: "lenora",
      team: [
        _("STOUTLAND", 62),
        _("GRANBULL", 56),
        _("SLOWKING", 64),
        _("FORRETRESS", 56)
      ],
      rewards: [
        205,
        199,
        210,
        569
      ]
    },
    {
      name: "Giovanni",
      avatar: "giovanni",
      leads: [0, 1],
      team: [
        _("Persian", 51),
        _("TYRANITAR", 70),
        _("GARCHOMP", 60),
        _("DEOXYS", 73)
      ],
      rewards: [
        386,
        248,
        612,
        621
      ]
    },
    {
      name: "Blackbelt Kenji",
      avatar: "blackbelt",
      team: [
        _("HITMONLEE", 65),
        _("Wobbuffet", 67),
        _("RHYDON", 50),
        _("KABUTOPS", 50)
      ],
      rewards: [
        202,
        473
      ]
    },
    {
      name: "Winona",
      avatar: "winona",
      leads: [0, 1, 2],
      team: [
        _("Moltres", 55, {
          moves: ["Will-O-Wisp", "Mystical Fire", "Protect", "Roost"]
        }),
        _("Zapdos", 55, {
          moves: ["Roost", "Thunder", "Light Screen", "Rain Dance"]
        }),
        _("Articuno", 55, {
          moves: ["Hail", "Blizzard", "Light Screen", "Roost"]
        }),
        _("Lugia", 72)
      ],
      rewards: [
        249
      ]
    },
    {
      name: "Bruno",
      avatar: "bruno-gen3",
      team: [
        _("Machamp", 70),
        _("Landorus", 55),
        _("Regirock", 56),
        _("Haxorus", 52)
      ],
      rewards: [
        377,
        645,
        185,
        589
      ]
    },
    {
      name: "Evelyn",
      avatar: "evelyn",
      team: [
        _("Entei", 62),
        _("Suicune", 63),
        _("Raikou", 61),
        _("JIRACHI", 65)
      ],
      rewards: [
        244,
        245,
        243,
        385
      ]
    },
    {
      name: "Scientist Igor",
      avatar: "scientist",
      team: [
        _("ABOMASNOW", 56),
        _("Hippowdon", 62),
        _("PELIPPER", 56),
        _("TORKOAL", 55)
      ],
      rewards: [
        450,
        530
      ]
    },
    {
      name: "Artist Pierre",
      avatar: "artist",
      leads: [0],
      team: [
        _("Ditto", 51),
        _("Ditto", 80),
        _("Ditto", 70),
        _("Ditto", 40)
      ],
      rewards: [
        642,
        376
      ]
    },
    {
      name: "Ethan",
      avatar: "ethan",
      team: [
        _("FERALIGATR", 62),
        _("BLAZIKEN", 67),
        _("GARDEVOIR", 57),
        _("METAGROSS", 58)
      ],
      rewards: [
        160,
        257
      ]
    },
    {
      name: "Guitarist Mara",
      avatar: "guitarist",
      team: [
        _("Exploud", 65, {
          moves: ["Hyper Voice", "Boomburst"]
        }),
        _("SEISMITOAD", 64, {
          moves: ["Earthquake", "Boomburst", "Toxic", "Rest"]
        }),
        _("FLYGON", 60, {
          moves: ["Bug Buzz", "Boomburst"]
        }),
        _("MELOETTA", 65, {
          moves: ["Hyper Voice", "Thunderbolt"]
        })
      ],
      rewards: [
        648,
        579
      ]
    },
    {
      name: "Lance",
      avatar: "lance",
      leads: [2, 3],
      team: [
        _("Dragonite", 75, {
          moves: ["Fire Blast", "Extreme Speed", "Dragon Rush", "Dragon Tail"]
        }),
        _("Groudon", 63),
        _("Milotic", 60, {
          moves: ["Dragon Tail", "Aqua Tail", "Water Pulse", "Light Screen"]
        }),
        _("Flygon", 58)
      ],
      rewards: [
        383,
        275,
        350,
        485
      ]
    },
    {
      name: "Bellelba",
      avatar: "bellelba",
      team: [
        _("DIALGA", 63),
        _("SERPERIOR", 55),
        _("TORNADUS", 64),
        _("KANGASKHAN", 52)
      ],
      rewards: [
        483,
        465,
        497,
        641
      ]
    },
    {
      name: "Norman",
      avatar: "norman",
      leads: [3],
      team: [
        _("Slaking", 70),
        _("TOGEKISS", 55),
        _("HAXORUS", 60),
        _("COFAGRIGUS", 69)
      ],
      rewards: [
        289,
        563,
        461,
        598
      ]
    },
    {
      name: "Shadow",
      avatar: "shadowtriad",
      leads: [1, 2],
      team: [
        _("BISHARP", 70, {
          moves: ["Stealth Rock", "Night Slash", "Iron Head"]
        }),
        _("LUCARIO", 68, {
          moves: ["Spikes", "Circle Throw", "Bullet Punch", "Close Combat"]
        }),
        _("Sandslash", 66, {
          moves: ["Spikes", "Stealth Rock", "Slash", "Poison Jab"]
        }),
        _("SHEDINJA", 55)
      ],
      rewards: [
        625,
        292
      ]
    },
    {
      name: "Volkner",
      avatar: "volkner",
      leads: [1],
      team: [
        _("Zapdos", 60, {
          moves: ["Thunder", "Hurricane", "Rain Dance"]
        }),
        _("KYOGRE", 67, {
          moves: ["Thunder", "Water Pulse"]
        }),
        _("EELEKTROSS", 56, {
          moves: ["Thunder", "Aqua Tail"]
        }),
        _("LUXRAY", 43)
      ],
      rewards: [
        382,
        405,
        604
      ]
    },
    {
      name: "Cyrus",
      avatar: "cyrus",
      team: [
        _("Palkia", 65),
        _("Reshiram", 68),
        _("WEAVILE", 45),
        _("Bronzong", 49)
      ],
      rewards: [
        484,
        643,
        448,
        526
      ]
    },
    {
      name: "Cynthia",
      avatar: "cynthia",
      team: [
        _("ZEKROM", 68),
        _("GARCHOMP", 67),
        _("SYLVEON", 57),
        _("VICTINI", 63)
      ],
      rewards: [
        445,
        494,
        700,
        644
      ]
    },
    {
      name: "Gary",
      avatar: "blue",
      team: [
        _("Blastoise", 73),
        _("INFERNAPE", 65),
        _("TORTERRA", 58),
        _("GENESECT", 70)
      ],
      rewards: [
        392,
        389,
        649,
        254
      ]
    },
    {
      name: "Team Rocket",
      avatar: "teamrocket",
      team: [
        _("Arbok", 51),
        _("WOBBUFFET", 48),
        _("Golem", 44, {
          moves: ["Explosion"]
        }),
        _("CROBAT", 46),
        _("Weezing", 52),
        _("VICTREEBEL", 48),
        _("GARBODOR", 40),
        _("Electrode", 43, {
          moves: ["Explosion"]
        })
      ],
      rewards: [
        488
      ]
    },
    {
      name: "AZ",
      avatar: "az",
      team: [
        _("GIRATINA", 72),
        _("DARKRAI", 70),
        _("NIDOKING", 52),
        _("METAGROSS", 61)
      ],
      rewards: [
        489,
        491
      ]
    },
    {
      name: "Zinnia",
      avatar: "zinnia",
      leads: [3],
      team: [
        _("Rayquaza", 77),
        _("SALAMENCE", 70),
        _("NIDOQUEEN", 60),
        _("GIGALITH", 50, {
          moves: ["Stealth Rock", "Rock Blast", "Earthquake", "Iron Head"]
        })
      ],
      rewards: [
        384
      ]
    },
    {
      name: "Ghetsis",
      avatar: "ghetsis",
      leads: [2, 3],
      team: [
        _("KYUREM", 82),
        _("HEATRAN", 67),
        _("GLISCOR", 61),
        _("DUSKNOIR", 65)
      ],
      rewards: [
        646
      ]
    },
    {
      name: "Ash",
      avatar: "ash",
      leads: [1, 2],
      team: [
        _("Pikachu", 90),
        _("Charizard", 63),
        _("Sceptile", 54),
        _("ARCEUS", 75)
      ],
      rewards: [
        493
      ]
    }
  ];

  // src/client/league-component.ts
  var LeagueComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.leagueLevel = 0;
      this.maxLeagueLevel = 0;
      this.leagueTrainer = null;
      this.pokemonInModal = null;
      this.template = `
        <div style="max-width: 500px;" class="font-mono container mx-auto px-4">

            <modal-component $if="pokemonInModal" :close="closePokemonModal">
                <div style="max-width: 300px;" class="bg-white p-5 mx-auto">
                    <pokemon-card-component :species="pokemonInModal" :league="true"></pokemon-card-component>
                </div>
            </modal-component>

            <img class="h-28 mx-auto mt-10" src="/img/pokemon_logo.png" alt="pokemon"/>
            <h1 class="main-menu text-center text-2xl mt-8 px-4">
                LEAGUE MODE
            </h1>
            <div $if="leagueTrainer">
                <div class="my-8">
                    <div class="flex flex-row justify-center">
                        <div class="grid grid-cols-2 mt-10">
                            <span $for="pokemon, i in leagueTrainer.team">
                                <img $if="i < 4" @click="()=>showPokemonModal(pokemon.species)" class="cursor-pointer h-12" src="/sprites/front/{{getSprite(pokemon)}}.png">
                            </span>
                        </div>
                        <img class="h-36 block" src="/sprites/trainers/{{leagueTrainer.avatar}}.png">
                        <div class="grid grid-cols-2 mt-10">
                            <span $for="pokemon, i in leagueTrainer.team">
                                <img $if="i > 3" @click="()=>showPokemonModal(pokemon.species)" class="cursor-pointer h-12" src="/sprites/front/{{getSprite(pokemon)}}.png">
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-row justify-center">
                        <h2 class="mt-5 text-lg">{{leagueTrainer.name}}</h2>
                    </div>
                </div>
                <terminal-component>
                </terminal-component>
                <div class="grid grid-cols-2 gap-1">
                    <div @click="selectBattle" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
                        Battle
                    </div>
                    <div @click="()=>$router.goTo('/')" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
                        Cancel
                    </div>
                    <div @click="prev" class="{{showPrev() ? 'cursor-pointer' : 'cursor-not-allowed'}} {{showPrev() ? 'bg-gray-100' : 'bg-gray-400'}} select-none ml-1 h-16 text-center text-lg pt-3 rounded border-2 border-solid border-black">
                        Prev
                    </div>
                    <div @click="next" class="{{showNext() ? 'cursor-pointer' : 'cursor-not-allowed'}} {{showNext() ? 'bg-gray-100' : 'bg-gray-400'}} select-none mr-1 h-16 text-center text-lg pt-3 rounded border-2 border-solid border-black">
                        Next
                    </div>
                </div>
            </div>
        </div>
    `;
      this.includes = {
        TerminalComponent,
        PokemonCardComponent
      };
    }
    setLeagueTrainer() {
      if (leagueTrainers.length > this.leagueLevel) {
        this.leagueTrainer = leagueTrainers[this.leagueLevel];
      } else {
        this.leagueTrainer = leagueTrainers[leagueTrainers.length - 1];
      }
    }
    afterMount() {
      return __async(this, null, function* () {
        const user = yield getUser();
        let leagueLevel = user.leagueLevel ? user.leagueLevel : 0;
        let leagueLevelFromUrl = getRequestParam("lvl");
        if (leagueLevelFromUrl != null) {
          leagueLevel = parseInt(leagueLevelFromUrl);
        }
        this.maxLeagueLevel = leagueLevel;
        this.leagueLevel = leagueLevel;
        this.setLeagueTrainer();
        this.$controller.publish({
          type: "DISPLAY_MESSAGE",
          message: `Defeat other trainers in the League to unlock new Pok\xE9mon!`
        });
      });
    }
    showPokemonModal(pokemon) {
      this.pokemonInModal = pokemon;
    }
    closePokemonModal() {
      this.pokemonInModal = null;
    }
    selectBattle() {
      return __async(this, null, function* () {
        const user = yield getUser();
        if (user.leagueBattleId) {
          this.$router.goTo(`/battle/${user.singlePlayerBattleId}`);
        } else {
          if (this.leagueTrainer) {
            const createBattleRequest = {
              battleType: "SINGLE_PLAYER",
              battleSubType: "LEAGUE",
              leagueLevel: this.leagueLevel
            };
            const battle = yield postBattle(createBattleRequest);
            this.$router.goTo(`/battle/${battle.battleId}`);
          } else {
            logInfo("Unable to create battle: leagueTrainer is null in league-component");
          }
        }
      });
    }
    showPrev() {
      return this.leagueLevel > 0;
    }
    showNext() {
      return this.leagueLevel < leagueTrainers.length - 1 && this.leagueLevel < this.maxLeagueLevel;
    }
    prev() {
      if (this.showPrev()) {
        this.leagueLevel--;
        this.setLeagueTrainer();
      }
    }
    next() {
      if (this.showNext()) {
        this.leagueLevel++;
        this.setLeagueTrainer();
      }
    }
  };

  // src/client/league-trainer-list-component.ts
  var LeagueTrainerListComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.trainers = leagueTrainers;
      this.template = `
        <div>
            <div $for="leagueTrainer, index in trainers">
                <div class="my-8">
                    <div class="flex flex-row justify-center">
                        <div class="grid grid-cols-2 mt-10">
                            <img $for="pokemon in leagueTrainer.team" class="h-12" src="/sprites/front/{{getSprite(pokemon)}}.png">
                        </div>
                        <img class="h-36 block" src="/sprites/trainers/{{leagueTrainer.avatar}}.png">
                        <div class="grid grid-cols-2 mt-10">
                            <img $for="rewardNumber in leagueTrainer.rewards" class="h-12" src="/sprites/front/{{getSprite(getPokemon(rewardNumber))}}.png">
                        </div>
                    </div>
                    <div class="flex flex-row justify-center">
                        <h2 class="mt-5 text-lg">{{leagueTrainer.name}} ({{index}})</h2>
                    </div>
                </div>
            </div>
        </div>
    `;
    }
    getPokemon(dexNumber) {
      return speciesList.find((s) => s.pokedexNumber === dexNumber);
    }
  };

  // src/model/arena.ts
  var arenaTrainers = [
    {
      name: "Aaron",
      avatar: "aaron",
      rank: 2,
      team: [
        buildPokemon("LUXRAY"),
        buildPokemon("ESCAVALIER"),
        buildPokemon("SHEDINJA"),
        buildPokemon("BLAZIKEN"),
        buildPokemon("SPIRITOMB"),
        buildPokemon("TOXICROAK")
      ]
    },
    {
      name: "Erika",
      avatar: "erika",
      rank: 2,
      leads: [1],
      team: [
        buildPokemon("VENUSAUR"),
        buildPokemon("KYOGRE"),
        buildPokemon("SCEPTILE"),
        buildPokemon("SEISMITOAD"),
        buildPokemon("TORTERRA"),
        buildPokemon("LUDICOLO")
      ]
    },
    {
      name: "Office Worker Will",
      avatar: "officeworker",
      rank: 2,
      leads: [0],
      team: [
        buildPokemon("Groudon"),
        buildPokemon("VICTREEBEL"),
        buildPokemon("EXEGGUTOR"),
        buildPokemon("TORKOAL"),
        buildPokemon("BLASTOISE"),
        buildPokemon("NIDOQUEEN")
      ]
    },
    {
      name: "Wattson",
      avatar: "wattson",
      rank: 2,
      leads: [0],
      team: [
        buildPokemon("ABOMASNOW"),
        buildPokemon("TANGROWTH"),
        buildPokemon("MAMOSWINE"),
        buildPokemon("GLACEON"),
        buildPokemon("TOXICROAK"),
        buildPokemon("HIPPOWDON")
      ]
    },
    {
      name: "Lusamine",
      avatar: "lusamine",
      rank: 3,
      team: [
        buildPokemon("RAYQUAZA"),
        buildPokemon("MAWILE"),
        buildPokemon("Deoxys"),
        buildPokemon("LUXRAY"),
        buildPokemon("SPIRITOMB"),
        buildPokemon("FROSLASS")
      ]
    },
    {
      name: "Battle Girl Kate",
      avatar: "battlegirl",
      rank: 1,
      team: [
        buildPokemon("HITMONLEE"),
        buildPokemon("HITMONTOP"),
        buildPokemon("KANGASKHAN"),
        buildPokemon("MR. MIME"),
        buildPokemon("JOLTEON"),
        buildPokemon("SCEPTILE")
      ]
    },
    {
      name: "Flannery",
      avatar: "flannery",
      rank: 2,
      leads: [0, 1],
      team: [
        buildPokemon("GROUDON"),
        buildPokemon("TORKOAL"),
        buildPokemon("DRAGONITE"),
        buildPokemon("MOLTRES"),
        buildPokemon("SABLEYE"),
        buildPokemon("RHYDON")
      ]
    },
    {
      name: "Skyla",
      avatar: "skyla",
      rank: 2,
      team: [
        buildPokemon("SUICUNE"),
        buildPokemon("HO-OH"),
        buildPokemon("SHIFTRY"),
        buildPokemon("BLAZIKEN"),
        buildPokemon("GARDEVOIR"),
        buildPokemon("TORTERRA")
      ]
    },
    {
      name: "Nurse Annie",
      avatar: "nurse",
      rank: 1,
      team: [
        buildPokemon("CHANSEY"),
        buildPokemon("BLISSEY"),
        buildPokemon("MELOETTA"),
        buildPokemon("UMBREON"),
        buildPokemon("SYLVEON"),
        buildPokemon("DONPHAN")
      ]
    },
    {
      name: "Ryuki",
      avatar: "ryuki",
      rank: 3,
      team: [
        buildPokemon("INFERNAPE"),
        buildPokemon("GENESECT"),
        buildPokemon("GIRATINA"),
        buildPokemon("AEGISLASH"),
        buildPokemon("EXCADRILL"),
        buildPokemon("GIGALITH")
      ]
    },
    {
      name: "Alder",
      avatar: "alder",
      leads: [3, 4],
      rank: 1,
      team: [
        buildPokemon("CHARIZARD"),
        buildPokemon("WEAVILE"),
        buildPokemon("HEATRAN"),
        buildPokemon("GLISCOR"),
        buildPokemon("STOUTLAND"),
        buildPokemon("CONKELDURR")
      ]
    },
    {
      name: "Chuck",
      avatar: "chuck",
      rank: 1,
      team: [
        buildPokemon("ENTEI"),
        buildPokemon("MACHAMP"),
        buildPokemon("RAPIDASH"),
        buildPokemon("TENTACRUEL"),
        buildPokemon("GOLEM"),
        buildPokemon("SHARPEDO")
      ]
    },
    {
      name: "Scientist Laura",
      avatar: "scientistf",
      rank: 2,
      team: [
        buildPokemon("Lugia"),
        buildPokemon("REGISTEEL"),
        buildPokemon("ROTOM"),
        buildPokemon("PORYGON-Z"),
        buildPokemon("GLACEON"),
        buildPokemon("TOGEKISS")
      ]
    },
    {
      name: "Bugsy",
      avatar: "bugsy",
      leads: [0, 1],
      rank: 1,
      team: [
        buildPokemon("Shuckle"),
        buildPokemon("Galvantula"),
        buildPokemon("Butterfree"),
        buildPokemon("Flygon"),
        buildPokemon("ELECTRODE"),
        buildPokemon("CLOYSTER")
      ]
    },
    {
      name: "Fisherman Johnny",
      avatar: "fisherman",
      rank: 1,
      leads: [0],
      team: [
        buildPokemon("PELIPPER"),
        buildPokemon("STARMIE"),
        buildPokemon("SEISMITOAD"),
        buildPokemon("DRAGONITE"),
        buildPokemon("EXEGGUTOR"),
        buildPokemon("forretress")
      ]
    },
    {
      name: "Boarder Jason",
      avatar: "boarder",
      rank: 2,
      leads: [0, 1],
      team: [
        buildPokemon("ABOMASNOW"),
        buildPokemon("VANILLUXE"),
        buildPokemon("MAMOSWINE"),
        buildPokemon("FROSLASS"),
        buildPokemon("CHANDELURE"),
        buildPokemon("CELEBI")
      ]
    },
    {
      name: "Li",
      avatar: "li",
      rank: 2,
      team: [
        buildPokemon("LUCARIO"),
        buildPokemon("TOXICROAK"),
        buildPokemon("COFAGRIGUS"),
        buildPokemon("FERROTHORN"),
        buildPokemon("SKARMORY"),
        buildPokemon("BRONZONG")
      ]
    },
    {
      name: "Juggler Craig",
      avatar: "juggler",
      rank: 1,
      team: [
        buildPokemon("FORRETRESS"),
        buildPokemon("WEEZING"),
        buildPokemon("BLISSEY"),
        buildPokemon("DONPHAN"),
        buildPokemon("GENGAR"),
        buildPokemon("WHIMSICOTT")
      ]
    },
    {
      name: "Saturn",
      avatar: "saturn",
      rank: 2,
      team: [
        buildPokemon("MEWTWO"),
        buildPokemon("TYPHLOSION"),
        buildPokemon("SABLEYE"),
        buildPokemon("ZEKROM"),
        buildPokemon("EELEKTROSS"),
        buildPokemon("DRUDDIGON")
      ]
    },
    {
      name: "Colress",
      avatar: "colress",
      rank: 2,
      team: [
        buildPokemon("MILOTIC"),
        buildPokemon("JIRACHI"),
        buildPokemon("SHIFTRY"),
        buildPokemon("CLAYDOL"),
        buildPokemon("REGIROCK"),
        buildPokemon("REGICE")
      ]
    },
    {
      name: "Benga",
      avatar: "benga",
      rank: 1,
      team: [
        buildPokemon("SALAMENCE"),
        buildPokemon("WEEZING"),
        buildPokemon("PINSIR"),
        buildPokemon("RATICATE"),
        buildPokemon("GYARADOS"),
        buildPokemon("GARCHOMP")
      ]
    },
    {
      name: "Zinzolin",
      avatar: "zinzolin",
      rank: 3,
      team: [
        buildPokemon("ARCEUS"),
        buildPokemon("HEATRAN"),
        buildPokemon("CRESSELIA"),
        buildPokemon("GIRATINA"),
        buildPokemon("DARKRAI"),
        buildPokemon("REUNICLUS")
      ]
    },
    {
      name: "Crasher Wake",
      avatar: "crasherwake",
      rank: 2,
      team: [
        buildPokemon("BLAZIKEN"),
        buildPokemon("ARTICUNO"),
        buildPokemon("GOLEM"),
        buildPokemon("MIENSHAO"),
        buildPokemon("THUNDURUS"),
        buildPokemon("BRELOOM")
      ]
    },
    {
      name: "Olivia",
      avatar: "olivia",
      rank: 2,
      leads: [0],
      team: [
        buildPokemon("GARCHOMP"),
        buildPokemon("STEELIX"),
        buildPokemon("DIALGA"),
        buildPokemon("CLOYSTER"),
        buildPokemon("RHYDON"),
        buildPokemon("PIKACHU")
      ]
    },
    {
      name: "Yellow",
      avatar: "yellow",
      rank: 1,
      leads: [3],
      team: [
        buildPokemon("MEWTWO"),
        buildPokemon("DRAGONITE"),
        buildPokemon("ARTICUNO"),
        buildPokemon("AERODACTYL"),
        buildPokemon("DITTO"),
        buildPokemon("PIKACHU")
      ]
    },
    {
      name: "Hoopster Arnie",
      avatar: "hoopster",
      rank: 1,
      leads: [1, 5],
      team: [
        buildPokemon("CONKELDURR"),
        buildPokemon("COFAGRIGUS"),
        buildPokemon("SEISMITOAD"),
        buildPokemon("WOBBUFFET"),
        buildPokemon("GENGAR"),
        buildPokemon("SHUCKLE")
      ]
    },
    {
      name: "Steven",
      avatar: "steven",
      rank: 3,
      team: [
        buildPokemon("KYUREM"),
        buildPokemon("STEELIX"),
        buildPokemon("SCIZOR"),
        buildPokemon("PALKIA"),
        buildPokemon("CRESSELIA"),
        buildPokemon("SERPERIOR")
      ]
    },
    {
      name: "Beauty Leslie",
      avatar: "beauty-gen7",
      rank: 1,
      team: [
        buildPokemon("PERSIAN"),
        buildPokemon("CLEFABLE"),
        buildPokemon("HYPNO"),
        buildPokemon("CLOYSTER"),
        buildPokemon("DEWGONG"),
        buildPokemon("RAPIDASH")
      ]
    },
    {
      name: "N",
      avatar: "n",
      rank: 3,
      team: [
        buildPokemon("TORNADUS"),
        buildPokemon("ARCEUS"),
        buildPokemon("RAYQUAZA"),
        buildPokemon("HAXORUS"),
        buildPokemon("REGICE"),
        buildPokemon("VICTINI")
      ]
    },
    {
      name: "Burglar Simon",
      avatar: "burglar",
      rank: 3,
      leads: [2],
      team: [
        buildPokemon("Zekrom"),
        buildPokemon("Darkrai"),
        buildPokemon("TYRANITAR"),
        buildPokemon("NINETALES"),
        buildPokemon("CHANDELURE"),
        buildPokemon("PROBOPASS")
      ]
    },
    {
      name: "Rocket Grunt Betty",
      avatar: "rocketgruntf",
      rank: 1,
      leads: [3],
      team: [
        buildPokemon("MOLTRES"),
        buildPokemon("ZAPDOS"),
        buildPokemon("MEW"),
        buildPokemon("SHUCKLE"),
        buildPokemon("MACHAMP"),
        buildPokemon("GENGAR")
      ]
    },
    {
      name: "Wikstrom",
      avatar: "wikstrom",
      rank: 3,
      team: [
        buildPokemon("Kyurem"),
        buildPokemon("DIALGA"),
        buildPokemon("AEGISLASH"),
        buildPokemon("Reshiram"),
        buildPokemon("AZUMARILL"),
        buildPokemon("SUDOWOODO")
      ]
    },
    {
      name: "Roxie",
      avatar: "roxie",
      rank: 3,
      leads: [1],
      team: [
        buildPokemon("DEOXYS"),
        buildPokemon("AERODACTYL"),
        buildPokemon("ZAPDOS"),
        buildPokemon("CROBAT"),
        buildPokemon("RAIKOU"),
        buildPokemon("SNORLAX")
      ]
    },
    {
      name: "Backpacker Jordan",
      avatar: "backpacker",
      rank: 2,
      team: [
        buildPokemon("HARIYAMA"),
        buildPokemon("SLAKING"),
        buildPokemon("REGISTEEL"),
        buildPokemon("SALAMENCE"),
        buildPokemon("MILOTIC"),
        buildPokemon("CLAYDOL")
      ]
    },
    {
      name: "Nate",
      avatar: "nate",
      rank: 2,
      team: [
        buildPokemon("ARCANINE"),
        buildPokemon("SHAYMIN"),
        buildPokemon("POLIWRATH"),
        buildPokemon("SCIZOR"),
        buildPokemon("HITMONCHAN"),
        buildPokemon("KINGLER")
      ]
    },
    {
      name: "Olympia",
      avatar: "olympia",
      rank: 3,
      leads: [0, 2],
      team: [
        buildPokemon("Lugia"),
        buildPokemon("Ho-oh"),
        buildPokemon("Venusaur"),
        buildPokemon("Spiritomb"),
        buildPokemon("Blissey"),
        buildPokemon("Cresselia")
      ]
    },
    {
      name: "Blaine",
      avatar: "blaine",
      rank: 2,
      leads: [0, 3],
      team: [
        buildPokemon("Torkoal"),
        buildPokemon("Ninetales"),
        buildPokemon("Gigalith"),
        buildPokemon("Hippowdon"),
        buildPokemon("Tyranitar"),
        buildPokemon("Ferrothorn")
      ]
    },
    {
      name: "Biker Gus",
      avatar: "biker",
      rank: 2,
      leads: [0, 1, 2],
      team: [
        buildPokemon("Garbodor"),
        buildPokemon("Tentacruel"),
        buildPokemon("Cofagrigus"),
        buildPokemon("Ferrothorn"),
        buildPokemon("Blissey"),
        buildPokemon("Heatran")
      ]
    },
    {
      name: "Whitney",
      avatar: "whitney",
      rank: 3,
      leads: [1, 2, 3],
      team: [
        buildPokemon("ARCEUS"),
        buildPokemon("METAGROSS"),
        buildPokemon("AERODACTYL"),
        buildPokemon("GARCHOMP"),
        buildPokemon("Suicune"),
        buildPokemon("CHANDELURE")
      ]
    },
    {
      name: "Kimono Girl Hanako",
      avatar: "kimonogirl",
      rank: 2,
      leads: [0, 1, 2],
      team: [
        buildPokemon("Skarmory"),
        buildPokemon("Klefki"),
        buildPokemon("Froslass"),
        buildPokemon("Dragonite"),
        buildPokemon("Hariyama"),
        buildPokemon("Arbok")
      ]
    },
    {
      name: "Rood",
      avatar: "rood",
      rank: 3,
      team: [
        buildPokemon("RESHIRAM"),
        buildPokemon("TORNADUS"),
        buildPokemon("HYDREIGON"),
        buildPokemon("DUSKNOIR"),
        buildPokemon("AEGISLASH"),
        buildPokemon("GENESECT")
      ]
    },
    {
      name: "Fire Breather Brendon",
      avatar: "firebreather",
      rank: 3,
      leads: [1, 2],
      team: [
        buildPokemon("HEATRAN"),
        buildPokemon("Arceus"),
        buildPokemon("TORKOAL"),
        buildPokemon("SLAKING"),
        buildPokemon("NIDOKING"),
        buildPokemon("DARMANITAN")
      ]
    },
    {
      name: "Siebold",
      avatar: "siebold",
      rank: 3,
      leads: [0, 1],
      team: [
        buildPokemon("SUICUNE"),
        buildPokemon("Kyogre"),
        buildPokemon("SEISMITOAD"),
        buildPokemon("LUGIA"),
        buildPokemon("LUDICOLO"),
        buildPokemon("DRAGONITE")
      ]
    },
    {
      name: "Plasma Grunt Wes",
      avatar: "plasmagrunt",
      rank: 3,
      team: [
        buildPokemon("ZEKROM"),
        buildPokemon("KLEFKI"),
        buildPokemon("GENESECT"),
        buildPokemon("THUNDURUS"),
        buildPokemon("FERROTHORN"),
        buildPokemon("REUNICLUS")
      ]
    },
    {
      name: "Grimsley",
      avatar: "grimsley",
      rank: 3,
      team: [
        buildPokemon("DARKRAI"),
        buildPokemon("Rayquaza"),
        buildPokemon("ZAPDOS"),
        buildPokemon("Kyogre"),
        buildPokemon("KANGASKHAN"),
        buildPokemon("SNORLAX")
      ]
    },
    {
      name: "Medium Edith",
      avatar: "medium",
      rank: 3,
      team: [
        buildPokemon("DARKRAI"),
        buildPokemon("PALKIA"),
        buildPokemon("TOGEKISS"),
        buildPokemon("GIRATINA"),
        buildPokemon("GARDEVOIR"),
        buildPokemon("Spiritomb")
      ]
    },
    {
      name: "Riley",
      avatar: "riley",
      rank: 3,
      team: [
        buildPokemon("PALKIA"),
        buildPokemon("VENUSAUR"),
        buildPokemon("TOGEKISS"),
        buildPokemon("RAYQUAZA"),
        buildPokemon("SHARPEDO"),
        buildPokemon("HARIYAMA")
      ]
    },
    {
      name: "Lennette",
      avatar: "parasollady",
      rank: 3,
      leads: [1, 2],
      team: [
        buildPokemon("BLISSEY"),
        buildPokemon("METAGROSS"),
        buildPokemon("Tyranitar"),
        buildPokemon("DRAGONITE"),
        buildPokemon("TANGROWTH"),
        buildPokemon("LUGIA")
      ]
    }
  ];

  // src/client/arena-trainer-list-component.ts
  var ArenaTrainerListComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.trainers = arenaTrainers.sort((a, b) => {
        return a.rank - b.rank;
      });
      this.template = `
        <div>
            <div $for="arenaTrainer, index in trainers">
                <div class="my-8">
                    <div class="flex flex-row justify-center">
                        <div class="grid grid-cols-2 mt-10">
                            <img $for="pokemon in arenaTrainer.team" class="h-12" src="/sprites/front/{{getSprite(pokemon)}}.png">
                        </div>
                        <img class="h-36 block" src="/sprites/trainers/{{arenaTrainer.avatar}}.png">
                    </div>
                    <div class="flex flex-row justify-center">
                        <h2 class="mt-5 text-lg">{{arenaTrainer.name}} ({{arenaTrainer.rank}})</h2>
                    </div>
                </div>
            </div>
        </div>
    `;
    }
    getPokemon(dexNumber) {
      return speciesList.find((s) => s.pokedexNumber === dexNumber);
    }
  };

  // src/client/app-component.ts
  var AppComponent = class {
    constructor() {
      this.template = `
    <div>
      <router-switch :routes="routes"></router-switch>
    </div>
  `;
    }
    beforeInit() {
      this.routes = [
        { path: "/battle/:battleId", component: BattleLoaderComponent },
        { path: "/pokedex", component: PokemonListComponent },
        { path: "/pokemon-table", component: PokemonTableComponent },
        { path: "/moves", component: MoveListComponent },
        { path: "/move-table", component: MoveTableComponent },
        { path: "/signup", component: SignupComponent },
        { path: "/login", component: LoginComponent },
        { path: "/play", component: MainMenuComponent },
        { path: "/singleplayer", component: MainMenuComponent },
        { path: "/league", component: LeagueComponent },
        { path: "/multiplayer", component: MainMenuComponent },
        { path: "/multiplayer/resume", component: MainMenuComponent },
        { path: "/challenge/:challengeId", component: ChallengeComponent },
        { path: "/test", component: SceneTestComponent },
        { path: "/settings", component: SettingsComponent },
        { path: "/league-trainers", component: LeagueTrainerListComponent },
        { path: "/arena-trainers", component: ArenaTrainerListComponent },
        { path: "/", component: MainMenuComponent }
      ];
    }
  };

  // src/client/controller.ts
  var Controller = class {
    constructor() {
      this.subscriptions = {};
    }
    subscribe(eventType, callback) {
      if (!this.subscriptions[eventType]) {
        this.subscriptions[eventType] = [];
      }
      logDebug("Adding subscription to " + eventType);
      this.subscriptions[eventType].push(callback);
    }
    unsubscribe(eventType, callback) {
      let success = false;
      const subscriptionsForType = this.subscriptions[eventType];
      if (subscriptionsForType && subscriptionsForType.includes(callback)) {
        const index = subscriptionsForType.indexOf(callback);
        if (index > -1) {
          subscriptionsForType.splice(index, 1);
          success = true;
        }
      }
      return success;
    }
    publish(event) {
      return __async(this, null, function* () {
        logDebug("Publishing event " + event.type);
        const subscriptions = this.subscriptions[event.type];
        if (subscriptions) {
          for (const callback of subscriptions) {
            yield callback(event);
          }
        }
      });
    }
  };

  // src/client/modal-component.ts
  var ModalComponent = class extends BaseComponent {
    constructor() {
      super(...arguments);
      this.template = `
    <div class="fixed z-40 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="min-h-screen pt-4 px-4 pb-40 text-center">

        <!-- Gray background -->
        <div @click="handleClose" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <!-- Content -->
        <div class="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all my-8 sm:align-middle sm:max-w-min sm:w-full">
          <slot></slot>
        </div>

      </div>
    </div>
  `;
    }
    handleClose() {
      if (this.props.close) {
        this.props.close();
      }
    }
  };

  // src/client/client.ts
  configureLogger({ enabled: true });
  globalAPI.mixin({
    $controller: new Controller(),
    getSprite: getSpriteName,
    getMoveDescription
  });
  globalAPI.install(NuroRouter);
  globalAPI.register("modal-component", ModalComponent);
  var element = document.createElement("div");
  document.body.appendChild(element);
  globalAPI.mount(AppComponent, element);
})();

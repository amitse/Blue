//  ********** Library dart:core **************
//  ********** Natives dart:core **************
function $defProp(obj, prop, value) {
  Object.defineProperty(obj, prop,
      {value: value, enumerable: false, writable: true, configurable: true});
}
function $throw(e) {
  // If e is not a value, we can use V8's captureStackTrace utility method.
  // TODO(jmesserly): capture the stack trace on other JS engines.
  if (e && (typeof e == 'object') && Error.captureStackTrace) {
    // TODO(jmesserly): this will clobber the e.stack property
    Error.captureStackTrace(e, $throw);
  }
  throw e;
}
$defProp(Object.prototype, '$index', function(i) {
  $throw(new NoSuchMethodException(this, "operator []", [i]));
});
$defProp(Array.prototype, '$index', function(index) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i];
});
$defProp(String.prototype, '$index', function(i) {
  return this[i];
});
$defProp(Object.prototype, '$setindex', function(i, value) {
  $throw(new NoSuchMethodException(this, "operator []=", [i, value]));
});
$defProp(Array.prototype, '$setindex', function(index, value) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i] = value;
});
function $add$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'string') {
    var str = (y == null) ? 'null' : y.toString();
    if (typeof(str) != 'string') {
      throw new Error("calling toString() on right hand operand of operator " +
      "+ did not return a String");
    }
    return x + str;
  } else if (typeof(x) == 'object') {
    return x.$add(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator +", [y]));
  }
}

function $add$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x + y;
  return $add$complex$(x, y);
}
function $eq$(x, y) {
  if (x == null) return y == null;
  return (typeof(x) != 'object') ? x === y : x.$eq(y);
}
// TODO(jimhug): Should this or should it not match equals?
$defProp(Object.prototype, '$eq', function(other) {
  return this === other;
});
function $lt$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$lt(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator <", [y]));
  }
}
function $lt$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x < y;
  return $lt$complex$(x, y);
}
function $mod$(x, y) {
  if (typeof(x) == 'number') {
    if (typeof(y) == 'number') {
      var result = x % y;
      if (result == 0) {
        return 0;  // Make sure we don't return -0.0.
      } else if (result < 0) {
        if (y < 0) {
          return result - y;
        } else {
          return result + y;
        }
      }
      return result;
    } else {
      $throw(new IllegalArgumentException(y));
    }
  } else if (typeof(x) == 'object') {
    return x.$mod(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator %", [y]));
  }
}
function $ne$(x, y) {
  if (x == null) return y != null;
  return (typeof(x) != 'object') ? x !== y : !x.$eq(y);
}
function $truncdiv$(x, y) {
  if (typeof(x) == 'number') {
    if (typeof(y) == 'number') {
      if (y == 0) $throw(new IntegerDivisionByZeroException());
      var tmp = x / y;
      return (tmp < 0) ? Math.ceil(tmp) : Math.floor(tmp);
    } else {
      $throw(new IllegalArgumentException(y));
    }
  } else if (typeof(x) == 'object') {
    return x.$truncdiv(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator ~/", [y]));
  }
}
/** Implements extends for Dart classes on JavaScript prototypes. */
function $inherits(child, parent) {
  if (child.prototype.__proto__) {
    child.prototype.__proto__ = parent.prototype;
  } else {
    function tmp() {};
    tmp.prototype = parent.prototype;
    child.prototype = new tmp();
    child.prototype.constructor = child;
  }
}
$defProp(Object.prototype, '$typeNameOf', (function() {
  function constructorNameWithFallback(obj) {
    var constructor = obj.constructor;
    if (typeof(constructor) == 'function') {
      // The constructor isn't null or undefined at this point. Try
      // to grab hold of its name.
      var name = constructor.name;
      // If the name is a non-empty string, we use that as the type
      // name of this object. On Firefox, we often get 'Object' as
      // the constructor name even for more specialized objects so
      // we have to fall through to the toString() based implementation
      // below in that case.
      if (typeof(name) == 'string' && name && name != 'Object') return name;
    }
    var string = Object.prototype.toString.call(obj);
    return string.substring(8, string.length - 1);
  }

  function chrome$typeNameOf() {
    var name = this.constructor.name;
    if (name == 'Window') return 'DOMWindow';
    return name;
  }

  function firefox$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    if (name == 'Document') return 'HTMLDocument';
    if (name == 'XMLDocument') return 'Document';
    return name;
  }

  function ie$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    // IE calls both HTML and XML documents 'Document', so we check for the
    // xmlVersion property, which is the empty string on HTML documents.
    if (name == 'Document' && this.xmlVersion) return 'Document';
    if (name == 'Document') return 'HTMLDocument';
    return name;
  }

  // If we're not in the browser, we're almost certainly running on v8.
  if (typeof(navigator) != 'object') return chrome$typeNameOf;

  var userAgent = navigator.userAgent;
  if (/Chrome|DumpRenderTree/.test(userAgent)) return chrome$typeNameOf;
  if (/Firefox/.test(userAgent)) return firefox$typeNameOf;
  if (/MSIE/.test(userAgent)) return ie$typeNameOf;
  return function() { return constructorNameWithFallback(this); };
})());
function $dynamic(name) {
  var f = Object.prototype[name];
  if (f && f.methods) return f.methods;

  var methods = {};
  if (f) methods.Object = f;
  function $dynamicBind() {
    // Find the target method
    var obj = this;
    var tag = obj.$typeNameOf();
    var method = methods[tag];
    if (!method) {
      var table = $dynamicMetadata;
      for (var i = 0; i < table.length; i++) {
        var entry = table[i];
        if (entry.map.hasOwnProperty(tag)) {
          method = methods[entry.tag];
          if (method) break;
        }
      }
    }
    method = method || methods.Object;

    var proto = Object.getPrototypeOf(obj);

    if (method == null) {
      // Trampoline to throw NoSuchMethodException (TODO: call noSuchMethod).
      method = function(){
        // Exact type check to prevent this code shadowing the dispatcher from a
        // subclass.
        if (Object.getPrototypeOf(this) === proto) {
          // TODO(sra): 'name' is the jsname, should be the Dart name.
          $throw(new NoSuchMethodException(
              obj, name, Array.prototype.slice.call(arguments)));
        }
        return Object.prototype[name].apply(this, arguments);
      };
    }

    if (!proto.hasOwnProperty(name)) {
      $defProp(proto, name, method);
    }

    return method.apply(this, Array.prototype.slice.call(arguments));
  };
  $dynamicBind.methods = methods;
  $defProp(Object.prototype, name, $dynamicBind);
  return methods;
}
if (typeof $dynamicMetadata == 'undefined') $dynamicMetadata = [];
Function.prototype.bind = Function.prototype.bind ||
  function(thisObj) {
    var func = this;
    var funcLength = func.$length || func.length;
    var argsLength = arguments.length;
    if (argsLength > 1) {
      var boundArgs = Array.prototype.slice.call(arguments, 1);
      var bound = function() {
        // Prepend the bound arguments to the current arguments.
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, boundArgs);
        return func.apply(thisObj, newArgs);
      };
      bound.$length = Math.max(0, funcLength - (argsLength - 1));
      return bound;
    } else {
      var bound = function() {
        return func.apply(thisObj, arguments);
      };
      bound.$length = funcLength;
      return bound;
    }
  };
function $dynamicSetMetadata(inputTable) {
  // TODO: Deal with light isolates.
  var table = [];
  for (var i = 0; i < inputTable.length; i++) {
    var tag = inputTable[i][0];
    var tags = inputTable[i][1];
    var map = {};
    var tagNames = tags.split('|');
    for (var j = 0; j < tagNames.length; j++) {
      map[tagNames[j]] = true;
    }
    table.push({tag: tag, tags: tags, map: map});
  }
  $dynamicMetadata = table;
}
// ********** Code for Object **************
$defProp(Object.prototype, "noSuchMethod", function(name, args) {
  $throw(new NoSuchMethodException(this, name, args));
});
$defProp(Object.prototype, "add$1", function($0) {
  return this.noSuchMethod("add", [$0]);
});
$defProp(Object.prototype, "clear$0", function() {
  return this.noSuchMethod("clear", []);
});
$defProp(Object.prototype, "is$Collection", function() {
  return false;
});
$defProp(Object.prototype, "is$Exception", function() {
  return false;
});
$defProp(Object.prototype, "is$List", function() {
  return false;
});
$defProp(Object.prototype, "is$Map", function() {
  return false;
});
$defProp(Object.prototype, "is$html_Element", function() {
  return false;
});
$defProp(Object.prototype, "remove$0", function() {
  return this.noSuchMethod("remove", []);
});
// ********** Code for Clock **************
function Clock() {}
Clock.now = function() {
  return new Date().getTime();
}
// ********** Code for IndexOutOfRangeException **************
function IndexOutOfRangeException(_index) {
  this._index = _index;
}
IndexOutOfRangeException.prototype.is$IndexOutOfRangeException = function(){return true};
IndexOutOfRangeException.prototype.is$Exception = function(){return true};
IndexOutOfRangeException.prototype.toString = function() {
  return ("IndexOutOfRangeException: " + this._index);
}
// ********** Code for NoSuchMethodException **************
function NoSuchMethodException(_receiver, _functionName, _arguments, _existingArgumentNames) {
  this._receiver = _receiver;
  this._functionName = _functionName;
  this._arguments = _arguments;
  this._existingArgumentNames = _existingArgumentNames;
}
NoSuchMethodException.prototype.is$NoSuchMethodException = function(){return true};
NoSuchMethodException.prototype.is$Exception = function(){return true};
NoSuchMethodException.prototype.toString = function() {
  var sb = new StringBufferImpl("");
  for (var i = (0);
   i < this._arguments.get$length(); i++) {
    if (i > (0)) {
      sb.add(", ");
    }
    sb.add(this._arguments.$index(i));
  }
  if (null == this._existingArgumentNames) {
    return (("NoSuchMethodException : method not found: '" + this._functionName + "'\n") + ("Receiver: " + this._receiver + "\n") + ("Arguments: [" + sb + "]"));
  }
  else {
    var actualParameters = sb.toString();
    sb = new StringBufferImpl("");
    for (var i = (0);
     i < this._existingArgumentNames.get$length(); i++) {
      if (i > (0)) {
        sb.add(", ");
      }
      sb.add(this._existingArgumentNames.$index(i));
    }
    var formalParameters = sb.toString();
    return ("NoSuchMethodException: incorrect number of arguments passed to " + ("method named '" + this._functionName + "'\nReceiver: " + this._receiver + "\n") + ("Tried calling: " + this._functionName + "(" + actualParameters + ")\n") + ("Found: " + this._functionName + "(" + formalParameters + ")"));
  }
}
// ********** Code for ClosureArgumentMismatchException **************
function ClosureArgumentMismatchException() {

}
ClosureArgumentMismatchException.prototype.is$Exception = function(){return true};
ClosureArgumentMismatchException.prototype.toString = function() {
  return "Closure argument mismatch";
}
// ********** Code for ObjectNotClosureException **************
function ObjectNotClosureException() {

}
ObjectNotClosureException.prototype.is$Exception = function(){return true};
ObjectNotClosureException.prototype.toString = function() {
  return "Object is not closure";
}
// ********** Code for IllegalArgumentException **************
function IllegalArgumentException(arg) {
  this._arg = arg;
}
IllegalArgumentException.prototype.is$IllegalArgumentException = function(){return true};
IllegalArgumentException.prototype.is$Exception = function(){return true};
IllegalArgumentException.prototype.toString = function() {
  return ("Illegal argument(s): " + this._arg);
}
// ********** Code for StackOverflowException **************
function StackOverflowException() {

}
StackOverflowException.prototype.is$Exception = function(){return true};
StackOverflowException.prototype.toString = function() {
  return "Stack Overflow";
}
// ********** Code for BadNumberFormatException **************
function BadNumberFormatException(_s) {
  this._s = _s;
}
BadNumberFormatException.prototype.is$Exception = function(){return true};
BadNumberFormatException.prototype.toString = function() {
  return ("BadNumberFormatException: '" + this._s + "'");
}
// ********** Code for NullPointerException **************
function NullPointerException(functionName, arguments) {
  this.functionName = functionName;
  this.arguments = arguments;
}
NullPointerException.prototype.is$Exception = function(){return true};
NullPointerException.prototype.toString = function() {
  if (this.functionName == null) {
    return this.get$exceptionName();
  }
  else {
    return (("" + this.get$exceptionName() + " : method: '" + this.functionName + "'\n") + "Receiver: null\n" + ("Arguments: " + this.arguments));
  }
}
NullPointerException.prototype.get$exceptionName = function() {
  return "NullPointerException";
}
// ********** Code for NoMoreElementsException **************
function NoMoreElementsException() {

}
NoMoreElementsException.prototype.is$Exception = function(){return true};
NoMoreElementsException.prototype.toString = function() {
  return "NoMoreElementsException";
}
// ********** Code for EmptyQueueException **************
function EmptyQueueException() {

}
EmptyQueueException.prototype.is$Exception = function(){return true};
EmptyQueueException.prototype.toString = function() {
  return "EmptyQueueException";
}
// ********** Code for UnsupportedOperationException **************
function UnsupportedOperationException(_message) {
  this._message = _message;
}
UnsupportedOperationException.prototype.is$Exception = function(){return true};
UnsupportedOperationException.prototype.toString = function() {
  return ("UnsupportedOperationException: " + this._message);
}
// ********** Code for IntegerDivisionByZeroException **************
function IntegerDivisionByZeroException() {

}
IntegerDivisionByZeroException.prototype.is$IntegerDivisionByZeroException = function(){return true};
IntegerDivisionByZeroException.prototype.is$Exception = function(){return true};
IntegerDivisionByZeroException.prototype.toString = function() {
  return "IntegerDivisionByZeroException";
}
// ********** Code for dart_core_Function **************
Function.prototype.to$call$0 = function() {
  this.call$0 = this._genStub(0);
  this.to$call$0 = function() { return this.call$0; };
  return this.call$0;
};
Function.prototype.call$0 = function() {
  return this.to$call$0()();
};
function to$call$0(f) { return f && f.to$call$0(); }
Function.prototype.to$call$1 = function() {
  this.call$1 = this._genStub(1);
  this.to$call$1 = function() { return this.call$1; };
  return this.call$1;
};
Function.prototype.call$1 = function($0) {
  return this.to$call$1()($0);
};
function to$call$1(f) { return f && f.to$call$1(); }
Function.prototype.to$call$2 = function() {
  this.call$2 = this._genStub(2);
  this.to$call$2 = function() { return this.call$2; };
  return this.call$2;
};
Function.prototype.call$2 = function($0, $1) {
  return this.to$call$2()($0, $1);
};
function to$call$2(f) { return f && f.to$call$2(); }
// ********** Code for Math **************
Math.parseInt = function(str) {
    var match = /^\s*[+-]?(?:(0[xX][abcdefABCDEF0-9]+)|\d+)\s*$/.exec(str);
    if (!match) $throw(new BadNumberFormatException(str));
    var isHex = !!match[1];
    var ret = parseInt(str, isHex ? 16 : 10);
    if (isNaN(ret)) $throw(new BadNumberFormatException(str));
    return ret;
}
// ********** Code for top level **************
function _toDartException(e) {
  function attachStack(dartEx) {
    // TODO(jmesserly): setting the stack property is not a long term solution.
    var stack = e.stack;
    // The stack contains the error message, and the stack is all that is
    // printed (the exception's toString() is never called).  Make the Dart
    // exception's toString() be the dominant message.
    if (typeof stack == 'string') {
      var message = dartEx.toString();
      if (/^(Type|Range)Error:/.test(stack)) {
        // Indent JS message (it can be helpful) so new message stands out.
        stack = '    (' + stack.substring(0, stack.indexOf('\n')) + ')\n' +
                stack.substring(stack.indexOf('\n') + 1);
      }
      stack = message + '\n' + stack;
    }
    dartEx.stack = stack;
    return dartEx;
  }

  if (e instanceof TypeError) {
    switch(e.type) {
      case 'property_not_function':
      case 'called_non_callable':
        if (e.arguments[0] == null) {
          return attachStack(new NullPointerException(null, []));
        } else {
          return attachStack(new ObjectNotClosureException());
        }
        break;
      case 'non_object_property_call':
      case 'non_object_property_load':
        return attachStack(new NullPointerException(null, []));
        break;
      case 'undefined_method':
        var mname = e.arguments[0];
        if (typeof(mname) == 'string' && (mname.indexOf('call$') == 0
            || mname == 'call' || mname == 'apply')) {
          return attachStack(new ObjectNotClosureException());
        } else {
          // TODO(jmesserly): fix noSuchMethod on operators so we don't hit this
          return attachStack(new NoSuchMethodException('', e.arguments[0], []));
        }
        break;
    }
  } else if (e instanceof RangeError) {
    if (e.message.indexOf('call stack') >= 0) {
      return attachStack(new StackOverflowException());
    }
  }
  return e;
}
//  ********** Library dart:coreimpl **************
// ********** Code for ListFactory **************
ListFactory = Array;
$defProp(ListFactory.prototype, "is$List", function(){return true});
$defProp(ListFactory.prototype, "is$Collection", function(){return true});
ListFactory.ListFactory$from$factory = function(other) {
  var list = [];
  for (var $$i = other.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    list.add$1(e);
  }
  return list;
}
$defProp(ListFactory.prototype, "get$length", function() { return this.length; });
$defProp(ListFactory.prototype, "set$length", function(value) { return this.length = value; });
$defProp(ListFactory.prototype, "add", function(value) {
  this.push(value);
});
$defProp(ListFactory.prototype, "addAll", function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var item = $$i.next();
    this.add(item);
  }
});
$defProp(ListFactory.prototype, "clear$_", function() {
  this.set$length((0));
});
$defProp(ListFactory.prototype, "removeLast", function() {
  return this.pop();
});
$defProp(ListFactory.prototype, "last", function() {
  return this.$index(this.get$length() - (1));
});
$defProp(ListFactory.prototype, "iterator", function() {
  return new ListIterator(this);
});
$defProp(ListFactory.prototype, "toString", function() {
  return Collections.collectionToString(this);
});
$defProp(ListFactory.prototype, "add$1", ListFactory.prototype.add);
$defProp(ListFactory.prototype, "clear$0", ListFactory.prototype.clear$_);
// ********** Code for ListIterator **************
function ListIterator(array) {
  this._array = array;
  this._pos = (0);
}
ListIterator.prototype.hasNext = function() {
  return this._array.get$length() > this._pos;
}
ListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._array.$index(this._pos++);
}
// ********** Code for JSSyntaxRegExp **************
function JSSyntaxRegExp(pattern, multiLine, ignoreCase) {
  JSSyntaxRegExp._create$ctor.call(this, pattern, $add$(($eq$(multiLine, true) ? "m" : ""), ($eq$(ignoreCase, true) ? "i" : "")));
}
JSSyntaxRegExp._create$ctor = function(pattern, flags) {
  this.re = new RegExp(pattern, flags);
      this.pattern = pattern;
      this.multiLine = this.re.multiline;
      this.ignoreCase = this.re.ignoreCase;
}
JSSyntaxRegExp._create$ctor.prototype = JSSyntaxRegExp.prototype;
JSSyntaxRegExp.prototype.hasMatch = function(str) {
  return this.re.test(str);
}
// ********** Code for NumImplementation **************
NumImplementation = Number;
NumImplementation.prototype.floor = function() {
  'use strict'; return Math.floor(this);
}
NumImplementation.prototype.hashCode = function() {
  'use strict'; return this & 0x1FFFFFFF;
}
// ********** Code for Collections **************
function Collections() {}
Collections.collectionToString = function(c) {
  var result = new StringBufferImpl("");
  Collections._emitCollection(c, result, new Array());
  return result.toString();
}
Collections._emitCollection = function(c, result, visiting) {
  visiting.add(c);
  var isList = !!(c && c.is$List());
  result.add(isList ? "[" : "{");
  var first = true;
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(e, result, visiting);
  }
  result.add(isList ? "]" : "}");
  visiting.removeLast();
}
Collections._emitObject = function(o, result, visiting) {
  if (!!(o && o.is$Collection())) {
    if (Collections._containsRef(visiting, o)) {
      result.add(!!(o && o.is$List()) ? "[...]" : "{...}");
    }
    else {
      Collections._emitCollection(o, result, visiting);
    }
  }
  else if (!!(o && o.is$Map())) {
    if (Collections._containsRef(visiting, o)) {
      result.add("{...}");
    }
    else {
      Maps._emitMap(o, result, visiting);
    }
  }
  else {
    result.add($eq$(o) ? "null" : o);
  }
}
Collections._containsRef = function(c, ref) {
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if ((null == e ? null == (ref) : e === ref)) return true;
  }
  return false;
}
// ********** Code for HashMapImplementation **************
function HashMapImplementation() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation.prototype.is$Map = function(){return true};
HashMapImplementation._computeLoadLimit = function(capacity) {
  return $truncdiv$((capacity * (3)), (4));
}
HashMapImplementation._firstProbe = function(hashCode, length) {
  return hashCode & (length - (1));
}
HashMapImplementation._nextProbe = function(currentProbe, numberOfProbes, length) {
  return (currentProbe + numberOfProbes) & (length - (1));
}
HashMapImplementation.prototype._probeForAdding = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  var insertionIndex = (-1);
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) {
      if (insertionIndex < (0)) return hash;
      return insertionIndex;
    }
    else if ($eq$(existingKey, key)) {
      return hash;
    }
    else if ((insertionIndex < (0)) && ((null == const$0000 ? null == (existingKey) : const$0000 === existingKey))) {
      insertionIndex = hash;
    }
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._ensureCapacity = function() {
  var newNumberOfEntries = this._numberOfEntries + (1);
  if (newNumberOfEntries >= this._loadLimit) {
    this._grow(this._keys.get$length() * (2));
    return;
  }
  var capacity = this._keys.get$length();
  var numberOfFreeOrDeleted = capacity - newNumberOfEntries;
  var numberOfFree = numberOfFreeOrDeleted - this._numberOfDeleted;
  if (this._numberOfDeleted > numberOfFree) {
    this._grow(this._keys.get$length());
  }
}
HashMapImplementation._isPowerOfTwo = function(x) {
  return ((x & (x - (1))) == (0));
}
HashMapImplementation.prototype._grow = function(newCapacity) {
  var capacity = this._keys.get$length();
  this._loadLimit = HashMapImplementation._computeLoadLimit(newCapacity);
  var oldKeys = this._keys;
  var oldValues = this._values;
  this._keys = new Array(newCapacity);
  this._values = new Array(newCapacity);
  for (var i = (0);
   i < capacity; i++) {
    var key = oldKeys.$index(i);
    if (null == key || (null == key ? null == (const$0000) : key === const$0000)) {
      continue;
    }
    var value = oldValues.$index(i);
    var newIndex = this._probeForAdding(key);
    this._keys.$setindex(newIndex, key);
    this._values.$setindex(newIndex, value);
  }
  this._numberOfDeleted = (0);
}
HashMapImplementation.prototype.clear$_ = function() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    this._keys.$setindex(i);
    this._values.$setindex(i);
  }
}
HashMapImplementation.prototype.$setindex = function(key, value) {
  var $0;
  this._ensureCapacity();
  var index = this._probeForAdding(key);
  if ((null == this._keys.$index(index)) || ((($0 = this._keys.$index(index)) == null ? null == (const$0000) : $0 === const$0000))) {
    this._numberOfEntries++;
  }
  this._keys.$setindex(index, key);
  this._values.$setindex(index, value);
}
HashMapImplementation.prototype.forEach = function(f) {
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    var key = this._keys.$index(i);
    if ((null != key) && ((null == key ? null != (const$0000) : key !== const$0000))) {
      f(key, this._values.$index(i));
    }
  }
}
HashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
HashMapImplementation.prototype.clear$0 = HashMapImplementation.prototype.clear$_;
// ********** Code for HashSetImplementation **************
function HashSetImplementation() {
  this._backingMap = new HashMapImplementation();
}
HashSetImplementation.prototype.is$Collection = function(){return true};
HashSetImplementation.prototype.clear$_ = function() {
  this._backingMap.clear$_();
}
HashSetImplementation.prototype.add = function(value) {
  this._backingMap.$setindex(value, value);
}
HashSetImplementation.prototype.addAll = function(collection) {
  var $this = this; // closure support
  collection.forEach(function _(value) {
    $this.add(value);
  }
  );
}
HashSetImplementation.prototype.forEach = function(f) {
  this._backingMap.forEach(function _(key, value) {
    f(key);
  }
  );
}
HashSetImplementation.prototype.filter = function(f) {
  var result = new HashSetImplementation();
  this._backingMap.forEach(function _(key, value) {
    if (f(key)) result.add(key);
  }
  );
  return result;
}
HashSetImplementation.prototype.iterator = function() {
  return new HashSetIterator(this);
}
HashSetImplementation.prototype.toString = function() {
  return Collections.collectionToString(this);
}
HashSetImplementation.prototype.add$1 = HashSetImplementation.prototype.add;
HashSetImplementation.prototype.clear$0 = HashSetImplementation.prototype.clear$_;
// ********** Code for HashSetIterator **************
function HashSetIterator(set_) {
  this._nextValidIndex = (-1);
  this._entries = set_._backingMap._keys;
  this._advance();
}
HashSetIterator.prototype.hasNext = function() {
  var $0;
  if (this._nextValidIndex >= this._entries.get$length()) return false;
  if ((($0 = this._entries.$index(this._nextValidIndex)) == null ? null == (const$0000) : $0 === const$0000)) {
    this._advance();
  }
  return this._nextValidIndex < this._entries.get$length();
}
HashSetIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  var res = this._entries.$index(this._nextValidIndex);
  this._advance();
  return res;
}
HashSetIterator.prototype._advance = function() {
  var length = this._entries.get$length();
  var entry;
  var deletedKey = const$0000;
  do {
    if (++this._nextValidIndex >= length) break;
    entry = this._entries.$index(this._nextValidIndex);
  }
  while ((null == entry) || ((null == entry ? null == (deletedKey) : entry === deletedKey)))
}
// ********** Code for _DeletedKeySentinel **************
function _DeletedKeySentinel() {

}
// ********** Code for Maps **************
function Maps() {}
Maps.mapToString = function(m) {
  var result = new StringBufferImpl("");
  Maps._emitMap(m, result, new Array());
  return result.toString();
}
Maps._emitMap = function(m, result, visiting) {
  visiting.add(m);
  result.add("{");
  var first = true;
  m.forEach((function (k, v) {
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(k, result, visiting);
    result.add(": ");
    Collections._emitObject(v, result, visiting);
  })
  );
  result.add("}");
  visiting.removeLast();
}
// ********** Code for DoubleLinkedQueueEntry **************
function DoubleLinkedQueueEntry(e) {
  this._element = e;
}
DoubleLinkedQueueEntry.prototype._link = function(p, n) {
  this._next = n;
  this._previous = p;
  p._next = this;
  n._previous = this;
}
DoubleLinkedQueueEntry.prototype.prepend = function(e) {
  new DoubleLinkedQueueEntry(e)._link(this._previous, this);
}
DoubleLinkedQueueEntry.prototype.remove = function() {
  this._previous._next = this._next;
  this._next._previous = this._previous;
  this._next = null;
  this._previous = null;
  return this._element;
}
DoubleLinkedQueueEntry.prototype.get$element = function() {
  return this._element;
}
DoubleLinkedQueueEntry.prototype.remove$0 = DoubleLinkedQueueEntry.prototype.remove;
// ********** Code for _DoubleLinkedQueueEntrySentinel **************
$inherits(_DoubleLinkedQueueEntrySentinel, DoubleLinkedQueueEntry);
function _DoubleLinkedQueueEntrySentinel() {
  DoubleLinkedQueueEntry.call(this, null);
  this._link(this, this);
}
_DoubleLinkedQueueEntrySentinel.prototype.remove = function() {
  $throw(const$0003);
}
_DoubleLinkedQueueEntrySentinel.prototype.get$element = function() {
  $throw(const$0003);
}
_DoubleLinkedQueueEntrySentinel.prototype.remove$0 = _DoubleLinkedQueueEntrySentinel.prototype.remove;
// ********** Code for DoubleLinkedQueue **************
function DoubleLinkedQueue() {
  this._sentinel = new _DoubleLinkedQueueEntrySentinel();
}
DoubleLinkedQueue.prototype.is$Collection = function(){return true};
DoubleLinkedQueue.prototype.addLast = function(value) {
  this._sentinel.prepend(value);
}
DoubleLinkedQueue.prototype.add = function(value) {
  this.addLast(value);
}
DoubleLinkedQueue.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    this.add(e);
  }
}
DoubleLinkedQueue.prototype.clear$_ = function() {
  this._sentinel._next = this._sentinel;
  this._sentinel._previous = this._sentinel;
}
DoubleLinkedQueue.prototype.forEach = function(f) {
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    f(entry._element);
    entry = nextEntry;
  }
}
DoubleLinkedQueue.prototype.filter = function(f) {
  var other = new DoubleLinkedQueue();
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    if (f(entry._element)) other.addLast(entry._element);
    entry = nextEntry;
  }
  return other;
}
DoubleLinkedQueue.prototype.iterator = function() {
  return new _DoubleLinkedQueueIterator(this._sentinel);
}
DoubleLinkedQueue.prototype.toString = function() {
  return Collections.collectionToString(this);
}
DoubleLinkedQueue.prototype.add$1 = DoubleLinkedQueue.prototype.add;
DoubleLinkedQueue.prototype.clear$0 = DoubleLinkedQueue.prototype.clear$_;
// ********** Code for _DoubleLinkedQueueIterator **************
function _DoubleLinkedQueueIterator(_sentinel) {
  this._sentinel = _sentinel;
  this._currentEntry = this._sentinel;
}
_DoubleLinkedQueueIterator.prototype.hasNext = function() {
  var $0;
  return (($0 = this._currentEntry._next) == null ? null != (this._sentinel) : $0 !== this._sentinel);
}
_DoubleLinkedQueueIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  this._currentEntry = this._currentEntry._next;
  return this._currentEntry.get$element();
}
// ********** Code for StringBufferImpl **************
function StringBufferImpl(content) {
  this.clear$_();
  this.add(content);
}
StringBufferImpl.prototype.add = function(obj) {
  var str = obj.toString();
  if (null == str || str.isEmpty()) return this;
  this._buffer.add(str);
  this._length = this._length + str.length;
  return this;
}
StringBufferImpl.prototype.addAll = function(objects) {
  for (var $$i = objects.iterator(); $$i.hasNext(); ) {
    var obj = $$i.next();
    this.add(obj);
  }
  return this;
}
StringBufferImpl.prototype.clear$_ = function() {
  this._buffer = new Array();
  this._length = (0);
  return this;
}
StringBufferImpl.prototype.toString = function() {
  if (this._buffer.get$length() == (0)) return "";
  if (this._buffer.get$length() == (1)) return this._buffer.$index((0));
  var result = StringBase.concatAll(this._buffer);
  this._buffer.clear$_();
  this._buffer.add(result);
  return result;
}
StringBufferImpl.prototype.add$1 = StringBufferImpl.prototype.add;
StringBufferImpl.prototype.clear$0 = StringBufferImpl.prototype.clear$_;
// ********** Code for StringBase **************
function StringBase() {}
StringBase.join = function(strings, separator) {
  if (strings.get$length() == (0)) return "";
  var s = strings.$index((0));
  for (var i = (1);
   i < strings.get$length(); i++) {
    s = $add$($add$(s, separator), strings.$index(i));
  }
  return s;
}
StringBase.concatAll = function(strings) {
  return StringBase.join(strings, "");
}
// ********** Code for StringImplementation **************
StringImplementation = String;
StringImplementation.prototype.isEmpty = function() {
  return this.length == (0);
}
StringImplementation.prototype.hashCode = function() {
      'use strict';
      var hash = 0;
      for (var i = 0; i < this.length; i++) {
        hash = 0x1fffffff & (hash + this.charCodeAt(i));
        hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
        hash ^= hash >> 6;
      }

      hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
      hash ^= hash >> 11;
      return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
}
// ********** Code for _ArgumentMismatchException **************
$inherits(_ArgumentMismatchException, ClosureArgumentMismatchException);
function _ArgumentMismatchException(_message) {
  this._dart_coreimpl_message = _message;
  ClosureArgumentMismatchException.call(this);
}
_ArgumentMismatchException.prototype.toString = function() {
  return ("Closure argument mismatch: " + this._dart_coreimpl_message);
}
// ********** Code for _FunctionImplementation **************
_FunctionImplementation = Function;
_FunctionImplementation.prototype._genStub = function(argsLength, names) {
      // Fast path #1: if no named arguments and arg count matches.
      var thisLength = this.$length || this.length;
      if (thisLength == argsLength && !names) {
        return this;
      }

      var paramsNamed = this.$optional ? (this.$optional.length / 2) : 0;
      var paramsBare = thisLength - paramsNamed;
      var argsNamed = names ? names.length : 0;
      var argsBare = argsLength - argsNamed;

      // Check we got the right number of arguments
      if (argsBare < paramsBare || argsLength > thisLength ||
          argsNamed > paramsNamed) {
        return function() {
          $throw(new _ArgumentMismatchException(
            'Wrong number of arguments to function. Expected ' + paramsBare +
            ' positional arguments and at most ' + paramsNamed +
            ' named arguments, but got ' + argsBare +
            ' positional arguments and ' + argsNamed + ' named arguments.'));
        };
      }

      // First, fill in all of the default values
      var p = new Array(paramsBare);
      if (paramsNamed) {
        p = p.concat(this.$optional.slice(paramsNamed));
      }
      // Fill in positional args
      var a = new Array(argsLength);
      for (var i = 0; i < argsBare; i++) {
        p[i] = a[i] = '$' + i;
      }
      // Then overwrite with supplied values for optional args
      var lastParameterIndex;
      var namesInOrder = true;
      for (var i = 0; i < argsNamed; i++) {
        var name = names[i];
        a[i + argsBare] = name;
        var j = this.$optional.indexOf(name);
        if (j < 0 || j >= paramsNamed) {
          return function() {
            $throw(new _ArgumentMismatchException(
              'Named argument "' + name + '" was not expected by function.' +
              ' Did you forget to mark the function parameter [optional]?'));
          };
        } else if (lastParameterIndex && lastParameterIndex > j) {
          namesInOrder = false;
        }
        p[j + paramsBare] = name;
        lastParameterIndex = j;
      }

      if (thisLength == argsLength && namesInOrder) {
        // Fast path #2: named arguments, but they're in order and all supplied.
        return this;
      }

      // Note: using Function instead of 'eval' to get a clean scope.
      // TODO(jmesserly): evaluate the performance of these stubs.
      var f = 'function(' + a.join(',') + '){return $f(' + p.join(',') + ');}';
      return new Function('$f', 'return ' + f + '').call(null, this);
    
}
// ********** Code for top level **************
//  ********** Library html **************
// ********** Code for _EventTargetImpl **************
// ********** Code for _NodeImpl **************
$dynamic("get$nodes").Node = function() {
  return new _ChildNodeListLazy(this);
}
$dynamic("remove").Node = function() {
  if ($ne$(this.get$parent())) {
    var parent = this.get$parent();
    parent.removeChild(this);
  }
  return this;
}
$dynamic("replaceWith").Node = function(otherNode) {
  try {
    var parent = this.get$parent();
    parent.replaceChild(otherNode, this);
  } catch (e) {
    e = _toDartException(e);
  }
  ;
  return this;
}
$dynamic("get$$$dom_childNodes").Node = function() {
  return this.childNodes;
}
$dynamic("get$parent").Node = function() {
  return this.parentNode;
}
$dynamic("set$text").Node = function(value) {
  this.textContent = value;
}
$dynamic("remove$0").Node = function() {
  return this.remove();
};
// ********** Code for _ElementImpl **************
$dynamic("is$html_Element").Element = function(){return true};
$dynamic("get$elements").Element = function() {
  return new _ChildrenElementList._wrap$ctor(this);
}
$dynamic("get$on").Element = function() {
  return new _ElementEventsImpl(this);
}
$dynamic("get$$$dom_children").Element = function() {
  return this.children;
}
$dynamic("get$$$dom_firstElementChild").Element = function() {
  return this.firstElementChild;
}
$dynamic("get$innerHTML").Element = function() { return this.innerHTML; };
$dynamic("set$innerHTML").Element = function(value) { return this.innerHTML = value; };
$dynamic("get$$$dom_lastElementChild").Element = function() {
  return this.lastElementChild;
}
// ********** Code for _HTMLElementImpl **************
// ********** Code for _AbstractWorkerImpl **************
// ********** Code for _AnchorElementImpl **************
// ********** Code for _AnimationImpl **************
// ********** Code for _EventImpl **************
// ********** Code for _AnimationEventImpl **************
// ********** Code for _AnimationListImpl **************
// ********** Code for _AppletElementImpl **************
// ********** Code for _AreaElementImpl **************
// ********** Code for _ArrayBufferImpl **************
// ********** Code for _ArrayBufferViewImpl **************
// ********** Code for _AttrImpl **************
$dynamic("set$value").Attr = function(value) { return this.value = value; };
// ********** Code for _AudioBufferImpl **************
// ********** Code for _AudioNodeImpl **************
// ********** Code for _AudioSourceNodeImpl **************
// ********** Code for _AudioBufferSourceNodeImpl **************
// ********** Code for _AudioChannelMergerImpl **************
// ********** Code for _AudioChannelSplitterImpl **************
// ********** Code for _AudioContextImpl **************
// ********** Code for _AudioDestinationNodeImpl **************
// ********** Code for _MediaElementImpl **************
$dynamic("get$on").HTMLMediaElement = function() {
  return new _MediaElementEventsImpl(this);
}
// ********** Code for _AudioElementImpl **************
// ********** Code for _AudioParamImpl **************
$dynamic("set$value").AudioParam = function(value) { return this.value = value; };
// ********** Code for _AudioGainImpl **************
// ********** Code for _AudioGainNodeImpl **************
// ********** Code for _AudioListenerImpl **************
// ********** Code for _AudioPannerNodeImpl **************
// ********** Code for _AudioProcessingEventImpl **************
// ********** Code for _BRElementImpl **************
// ********** Code for _BarInfoImpl **************
// ********** Code for _BaseElementImpl **************
// ********** Code for _BaseFontElementImpl **************
// ********** Code for _BatteryManagerImpl **************
// ********** Code for _BeforeLoadEventImpl **************
// ********** Code for _BiquadFilterNodeImpl **************
// ********** Code for _BlobImpl **************
// ********** Code for _BlobBuilderImpl **************
// ********** Code for _BodyElementImpl **************
$dynamic("get$on").HTMLBodyElement = function() {
  return new _BodyElementEventsImpl(this);
}
// ********** Code for _EventsImpl **************
function _EventsImpl(_ptr) {
  this._ptr = _ptr;
}
_EventsImpl.prototype._get = function(type) {
  return new _EventListenerListImpl(this._ptr, type);
}
// ********** Code for _ElementEventsImpl **************
$inherits(_ElementEventsImpl, _EventsImpl);
function _ElementEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_ElementEventsImpl.prototype.get$change = function() {
  return this._get("change");
}
// ********** Code for _BodyElementEventsImpl **************
$inherits(_BodyElementEventsImpl, _ElementEventsImpl);
function _BodyElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
// ********** Code for _ButtonElementImpl **************
$dynamic("set$value").HTMLButtonElement = function(value) { return this.value = value; };
// ********** Code for _CharacterDataImpl **************
// ********** Code for _TextImpl **************
// ********** Code for _CDATASectionImpl **************
// ********** Code for _CSSRuleImpl **************
// ********** Code for _CSSCharsetRuleImpl **************
// ********** Code for _CSSFontFaceRuleImpl **************
// ********** Code for _CSSImportRuleImpl **************
// ********** Code for _CSSKeyframeRuleImpl **************
// ********** Code for _CSSKeyframesRuleImpl **************
// ********** Code for _CSSMatrixImpl **************
// ********** Code for _CSSMediaRuleImpl **************
// ********** Code for _CSSPageRuleImpl **************
// ********** Code for _CSSValueImpl **************
// ********** Code for _CSSPrimitiveValueImpl **************
// ********** Code for _CSSRuleListImpl **************
// ********** Code for _CSSStyleDeclarationImpl **************
// ********** Code for _CSSStyleRuleImpl **************
// ********** Code for _StyleSheetImpl **************
// ********** Code for _CSSStyleSheetImpl **************
// ********** Code for _CSSValueListImpl **************
// ********** Code for _CSSTransformValueImpl **************
// ********** Code for _CSSUnknownRuleImpl **************
// ********** Code for _CanvasElementImpl **************
// ********** Code for _CanvasGradientImpl **************
// ********** Code for _CanvasPatternImpl **************
// ********** Code for _CanvasPixelArrayImpl **************
$dynamic("is$List").CanvasPixelArray = function(){return true};
$dynamic("is$Collection").CanvasPixelArray = function(){return true};
$dynamic("get$length").CanvasPixelArray = function() { return this.length; };
$dynamic("$index").CanvasPixelArray = function(index) {
  return this[index];
}
$dynamic("$setindex").CanvasPixelArray = function(index, value) {
  this[index] = value
}
$dynamic("iterator").CanvasPixelArray = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").CanvasPixelArray = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").CanvasPixelArray = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").CanvasPixelArray = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").CanvasPixelArray = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").CanvasPixelArray = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").CanvasPixelArray = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").CanvasPixelArray = function($0) {
  return this.add($0);
};
// ********** Code for _CanvasRenderingContextImpl **************
// ********** Code for _CanvasRenderingContext2DImpl **************
// ********** Code for _ClientRectImpl **************
// ********** Code for _ClientRectListImpl **************
// ********** Code for _ClipboardImpl **************
// ********** Code for _CloseEventImpl **************
// ********** Code for _CommentImpl **************
// ********** Code for _UIEventImpl **************
// ********** Code for _CompositionEventImpl **************
// ********** Code for _ContentElementImpl **************
// ********** Code for _ConvolverNodeImpl **************
// ********** Code for _CoordinatesImpl **************
// ********** Code for _CounterImpl **************
// ********** Code for _CryptoImpl **************
// ********** Code for _CustomEventImpl **************
// ********** Code for _DListElementImpl **************
// ********** Code for _DOMApplicationCacheImpl **************
// ********** Code for _DOMExceptionImpl **************
// ********** Code for _DOMFileSystemImpl **************
// ********** Code for _DOMFileSystemSyncImpl **************
// ********** Code for _DOMFormDataImpl **************
// ********** Code for _DOMImplementationImpl **************
// ********** Code for _DOMMimeTypeImpl **************
// ********** Code for _DOMMimeTypeArrayImpl **************
// ********** Code for _DOMParserImpl **************
// ********** Code for _DOMPluginImpl **************
// ********** Code for _DOMPluginArrayImpl **************
// ********** Code for _DOMSelectionImpl **************
// ********** Code for _DOMTokenListImpl **************
$dynamic("add$1").DOMTokenList = function($0) {
  return this.add($0);
};
// ********** Code for _DOMSettableTokenListImpl **************
$dynamic("set$value").DOMSettableTokenList = function(value) { return this.value = value; };
// ********** Code for _DOMURLImpl **************
// ********** Code for _DataTransferItemImpl **************
// ********** Code for _DataTransferItemListImpl **************
$dynamic("add$1").DataTransferItemList = function($0) {
  return this.add($0);
};
$dynamic("clear$0").DataTransferItemList = function() {
  return this.clear();
};
// ********** Code for _DataViewImpl **************
// ********** Code for _DatabaseImpl **************
// ********** Code for _DatabaseSyncImpl **************
// ********** Code for _WorkerContextImpl **************
// ********** Code for _DedicatedWorkerContextImpl **************
// ********** Code for _DelayNodeImpl **************
// ********** Code for _DeprecatedPeerConnectionImpl **************
// ********** Code for _DetailsElementImpl **************
// ********** Code for _DeviceMotionEventImpl **************
// ********** Code for _DeviceOrientationEventImpl **************
// ********** Code for _DirectoryElementImpl **************
// ********** Code for _EntryImpl **************
// ********** Code for _DirectoryEntryImpl **************
// ********** Code for _EntrySyncImpl **************
$dynamic("remove$0").EntrySync = function() {
  return this.remove();
};
// ********** Code for _DirectoryEntrySyncImpl **************
// ********** Code for _DirectoryReaderImpl **************
// ********** Code for _DirectoryReaderSyncImpl **************
// ********** Code for _DivElementImpl **************
// ********** Code for _DocumentImpl **************
$dynamic("is$html_Element").HTMLDocument = function(){return true};
$dynamic("query").HTMLDocument = function(selectors) {
  if (const$0002.hasMatch(selectors)) {
    return this.getElementById(selectors.substring((1)));
  }
  return this.$dom_querySelector(selectors);
}
$dynamic("$dom_querySelector").HTMLDocument = function(selectors) {
  return this.querySelector(selectors);
}
// ********** Code for FilteredElementList **************
function FilteredElementList(node) {
  this._childNodes = node.get$nodes();
  this._node = node;
}
FilteredElementList.prototype.is$List = function(){return true};
FilteredElementList.prototype.is$Collection = function(){return true};
FilteredElementList.prototype.get$_filtered = function() {
  return ListFactory.ListFactory$from$factory(this._childNodes.filter((function (n) {
    return !!(n && n.is$html_Element());
  })
  ));
}
FilteredElementList.prototype.get$first = function() {
  var $$list = this._childNodes;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    if (!!(node && node.is$html_Element())) {
      return node;
    }
  }
  return null;
}
FilteredElementList.prototype.forEach = function(f) {
  this.get$_filtered().forEach(f);
}
FilteredElementList.prototype.$setindex = function(index, value) {
  this.$index(index).replaceWith(value);
}
FilteredElementList.prototype.add = function(value) {
  this._childNodes.add(value);
}
FilteredElementList.prototype.get$add = function() {
  return this.add.bind(this);
}
FilteredElementList.prototype.addAll = function(collection) {
  collection.forEach(this.get$add());
}
FilteredElementList.prototype.clear$_ = function() {
  this._childNodes.clear$_();
}
FilteredElementList.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    result.remove$0();
  }
  return result;
}
FilteredElementList.prototype.filter = function(f) {
  return this.get$_filtered().filter(f);
}
FilteredElementList.prototype.get$length = function() {
  return this.get$_filtered().get$length();
}
FilteredElementList.prototype.$index = function(index) {
  return this.get$_filtered().$index(index);
}
FilteredElementList.prototype.iterator = function() {
  return this.get$_filtered().iterator();
}
FilteredElementList.prototype.last = function() {
  return this.get$_filtered().last();
}
FilteredElementList.prototype.add$1 = FilteredElementList.prototype.add;
FilteredElementList.prototype.clear$0 = FilteredElementList.prototype.clear$_;
// ********** Code for _DocumentFragmentImpl **************
$dynamic("is$html_Element").DocumentFragment = function(){return true};
$dynamic("get$elements").DocumentFragment = function() {
  if (this._elements == null) {
    this._elements = new FilteredElementList(this);
  }
  return this._elements;
}
$dynamic("get$innerHTML").DocumentFragment = function() {
  var e = _ElementFactoryProvider.Element$tag$factory("div");
  e.get$nodes().add(this.cloneNode(true));
  return e.get$innerHTML();
}
$dynamic("set$innerHTML").DocumentFragment = function(value) {
  this.get$nodes().clear$_();
  var e = _ElementFactoryProvider.Element$tag$factory("div");
  e.set$innerHTML(value);
  var nodes = ListFactory.ListFactory$from$factory(e.get$nodes());
  this.get$nodes().addAll(nodes);
}
$dynamic("get$parent").DocumentFragment = function() {
  return null;
}
// ********** Code for _DocumentTypeImpl **************
// ********** Code for _DynamicsCompressorNodeImpl **************
// ********** Code for _EXTTextureFilterAnisotropicImpl **************
// ********** Code for _ChildrenElementList **************
_ChildrenElementList._wrap$ctor = function(element) {
  this._childElements = element.get$$$dom_children();
  this._html_element = element;
}
_ChildrenElementList._wrap$ctor.prototype = _ChildrenElementList.prototype;
function _ChildrenElementList() {}
_ChildrenElementList.prototype.is$List = function(){return true};
_ChildrenElementList.prototype.is$Collection = function(){return true};
_ChildrenElementList.prototype._toList = function() {
  var output = new Array(this._childElements.get$length());
  for (var i = (0), len = this._childElements.get$length();
   i < len; i++) {
    output.$setindex(i, this._childElements.$index(i));
  }
  return output;
}
_ChildrenElementList.prototype.get$first = function() {
  return this._html_element.get$$$dom_firstElementChild();
}
_ChildrenElementList.prototype.forEach = function(f) {
  var $$list = this._childElements;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    f(element);
  }
}
_ChildrenElementList.prototype.filter = function(f) {
  var output = [];
  this.forEach((function (element) {
    if (f(element)) {
      output.add$1(element);
    }
  })
  );
  return new _FrozenElementList._wrap$ctor(output);
}
_ChildrenElementList.prototype.get$length = function() {
  return this._childElements.get$length();
}
_ChildrenElementList.prototype.$index = function(index) {
  return this._childElements.$index(index);
}
_ChildrenElementList.prototype.$setindex = function(index, value) {
  this._html_element.replaceChild(value, this._childElements.$index(index));
}
_ChildrenElementList.prototype.add = function(value) {
  this._html_element.appendChild(value);
  return value;
}
_ChildrenElementList.prototype.iterator = function() {
  return this._toList().iterator();
}
_ChildrenElementList.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    this._html_element.appendChild(element);
  }
}
_ChildrenElementList.prototype.clear$_ = function() {
  this._html_element.set$text("");
}
_ChildrenElementList.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._html_element.removeChild(result);
  }
  return result;
}
_ChildrenElementList.prototype.last = function() {
  return this._html_element.get$$$dom_lastElementChild();
}
_ChildrenElementList.prototype.add$1 = _ChildrenElementList.prototype.add;
_ChildrenElementList.prototype.clear$0 = _ChildrenElementList.prototype.clear$_;
// ********** Code for _FrozenElementList **************
_FrozenElementList._wrap$ctor = function(_nodeList) {
  this._nodeList = _nodeList;
}
_FrozenElementList._wrap$ctor.prototype = _FrozenElementList.prototype;
function _FrozenElementList() {}
_FrozenElementList.prototype.is$List = function(){return true};
_FrozenElementList.prototype.is$Collection = function(){return true};
_FrozenElementList.prototype.get$first = function() {
  return this._nodeList.$index((0));
}
_FrozenElementList.prototype.forEach = function(f) {
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var el = $$i.next();
    f(el);
  }
}
_FrozenElementList.prototype.filter = function(f) {
  var out = new _ElementList([]);
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var el = $$i.next();
    if (f(el)) out.add$1(el);
  }
  return out;
}
_FrozenElementList.prototype.get$length = function() {
  return this._nodeList.get$length();
}
_FrozenElementList.prototype.$index = function(index) {
  return this._nodeList.$index(index);
}
_FrozenElementList.prototype.$setindex = function(index, value) {
  $throw(const$0004);
}
_FrozenElementList.prototype.add = function(value) {
  $throw(const$0004);
}
_FrozenElementList.prototype.iterator = function() {
  return new _FrozenElementListIterator(this);
}
_FrozenElementList.prototype.addAll = function(collection) {
  $throw(const$0004);
}
_FrozenElementList.prototype.clear$_ = function() {
  $throw(const$0004);
}
_FrozenElementList.prototype.removeLast = function() {
  $throw(const$0004);
}
_FrozenElementList.prototype.last = function() {
  return this._nodeList.last();
}
_FrozenElementList.prototype.add$1 = _FrozenElementList.prototype.add;
_FrozenElementList.prototype.clear$0 = _FrozenElementList.prototype.clear$_;
// ********** Code for _FrozenElementListIterator **************
function _FrozenElementListIterator(_list) {
  this._html_index = (0);
  this._html_list = _list;
}
_FrozenElementListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_list.$index(this._html_index++);
}
_FrozenElementListIterator.prototype.hasNext = function() {
  return this._html_index < this._html_list.get$length();
}
// ********** Code for _ListWrapper **************
function _ListWrapper() {}
_ListWrapper.prototype.is$List = function(){return true};
_ListWrapper.prototype.is$Collection = function(){return true};
_ListWrapper.prototype.iterator = function() {
  return this._html_list.iterator();
}
_ListWrapper.prototype.forEach = function(f) {
  return this._html_list.forEach(f);
}
_ListWrapper.prototype.filter = function(f) {
  return this._html_list.filter(f);
}
_ListWrapper.prototype.get$length = function() {
  return this._html_list.get$length();
}
_ListWrapper.prototype.$index = function(index) {
  return this._html_list.$index(index);
}
_ListWrapper.prototype.$setindex = function(index, value) {
  this._html_list.$setindex(index, value);
}
_ListWrapper.prototype.add = function(value) {
  return this._html_list.add(value);
}
_ListWrapper.prototype.addAll = function(collection) {
  return this._html_list.addAll(collection);
}
_ListWrapper.prototype.clear$_ = function() {
  return this._html_list.clear$_();
}
_ListWrapper.prototype.removeLast = function() {
  return this._html_list.removeLast();
}
_ListWrapper.prototype.last = function() {
  return this._html_list.last();
}
_ListWrapper.prototype.get$first = function() {
  return this._html_list.$index((0));
}
_ListWrapper.prototype.add$1 = _ListWrapper.prototype.add;
_ListWrapper.prototype.clear$0 = _ListWrapper.prototype.clear$_;
// ********** Code for _ListWrapper_Element **************
$inherits(_ListWrapper_Element, _ListWrapper);
function _ListWrapper_Element(_list) {
  this._html_list = _list;
}
_ListWrapper_Element.prototype.add$1 = _ListWrapper_Element.prototype.add;
_ListWrapper_Element.prototype.clear$0 = _ListWrapper_Element.prototype.clear$_;
// ********** Code for _ElementList **************
$inherits(_ElementList, _ListWrapper_Element);
function _ElementList(list) {
  _ListWrapper_Element.call(this, list);
}
_ElementList.prototype.filter = function(f) {
  return new _ElementList(_ListWrapper_Element.prototype.filter.call(this, f));
}
// ********** Code for _ElementFactoryProvider **************
function _ElementFactoryProvider() {}
_ElementFactoryProvider.Element$tag$factory = function(tag) {
  return document.createElement(tag)
}
// ********** Code for _ElementTimeControlImpl **************
// ********** Code for _ElementTraversalImpl **************
// ********** Code for _EmbedElementImpl **************
// ********** Code for _EntityImpl **************
// ********** Code for _EntityReferenceImpl **************
// ********** Code for _EntryArrayImpl **************
// ********** Code for _EntryArraySyncImpl **************
// ********** Code for _ErrorEventImpl **************
// ********** Code for _EventExceptionImpl **************
// ********** Code for _EventSourceImpl **************
// ********** Code for _EventListenerListImpl **************
function _EventListenerListImpl(_ptr, _type) {
  this._ptr = _ptr;
  this._type = _type;
}
_EventListenerListImpl.prototype.add = function(listener, useCapture) {
  this._add(listener, useCapture);
  return this;
}
_EventListenerListImpl.prototype._add = function(listener, useCapture) {
  this._ptr.addEventListener(this._type, listener, useCapture);
}
_EventListenerListImpl.prototype.add$1 = function($0) {
  return this.add(to$call$1($0), false);
};
// ********** Code for _FieldSetElementImpl **************
// ********** Code for _FileImpl **************
// ********** Code for _FileEntryImpl **************
// ********** Code for _FileEntrySyncImpl **************
// ********** Code for _FileErrorImpl **************
// ********** Code for _FileExceptionImpl **************
// ********** Code for _FileListImpl **************
// ********** Code for _FileReaderImpl **************
// ********** Code for _FileReaderSyncImpl **************
// ********** Code for _FileWriterImpl **************
// ********** Code for _FileWriterSyncImpl **************
// ********** Code for _Float32ArrayImpl **************
$dynamic("is$List").Float32Array = function(){return true};
$dynamic("is$Collection").Float32Array = function(){return true};
$dynamic("get$length").Float32Array = function() { return this.length; };
$dynamic("$index").Float32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float32Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Float32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Float32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Float32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").Float32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Float32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Float32Array = function($0) {
  return this.add($0);
};
// ********** Code for _Float64ArrayImpl **************
$dynamic("is$List").Float64Array = function(){return true};
$dynamic("is$Collection").Float64Array = function(){return true};
$dynamic("get$length").Float64Array = function() { return this.length; };
$dynamic("$index").Float64Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float64Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float64Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float64Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Float64Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Float64Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Float64Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").Float64Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Float64Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Float64Array = function($0) {
  return this.add($0);
};
// ********** Code for _FontElementImpl **************
// ********** Code for _FormElementImpl **************
// ********** Code for _FrameElementImpl **************
// ********** Code for _FrameSetElementImpl **************
$dynamic("get$on").HTMLFrameSetElement = function() {
  return new _FrameSetElementEventsImpl(this);
}
// ********** Code for _FrameSetElementEventsImpl **************
$inherits(_FrameSetElementEventsImpl, _ElementEventsImpl);
function _FrameSetElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
// ********** Code for _GeolocationImpl **************
// ********** Code for _GeopositionImpl **************
// ********** Code for _HRElementImpl **************
// ********** Code for _HTMLAllCollectionImpl **************
// ********** Code for _HTMLCollectionImpl **************
$dynamic("is$List").HTMLCollection = function(){return true};
$dynamic("is$Collection").HTMLCollection = function(){return true};
$dynamic("get$length").HTMLCollection = function() { return this.length; };
$dynamic("$index").HTMLCollection = function(index) {
  return this[index];
}
$dynamic("$setindex").HTMLCollection = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").HTMLCollection = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").HTMLCollection = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").HTMLCollection = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").HTMLCollection = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").HTMLCollection = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").HTMLCollection = function() {
  return this.$index(this.get$length() - (1));
}
$dynamic("removeLast").HTMLCollection = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").HTMLCollection = function($0) {
  return this.add($0);
};
// ********** Code for _HTMLOptionsCollectionImpl **************
$dynamic("get$length").HTMLOptionsCollection = function() {
  return this.length;
}
// ********** Code for _HashChangeEventImpl **************
// ********** Code for _HeadElementImpl **************
// ********** Code for _HeadingElementImpl **************
// ********** Code for _HistoryImpl **************
// ********** Code for _HtmlElementImpl **************
// ********** Code for _IDBAnyImpl **************
// ********** Code for _IDBCursorImpl **************
// ********** Code for _IDBCursorWithValueImpl **************
// ********** Code for _IDBDatabaseImpl **************
// ********** Code for _IDBDatabaseExceptionImpl **************
// ********** Code for _IDBFactoryImpl **************
// ********** Code for _IDBIndexImpl **************
// ********** Code for _IDBKeyImpl **************
// ********** Code for _IDBKeyRangeImpl **************
// ********** Code for _IDBObjectStoreImpl **************
$dynamic("add$1").IDBObjectStore = function($0) {
  return this.add($0);
};
$dynamic("clear$0").IDBObjectStore = function() {
  return this.clear();
};
// ********** Code for _IDBRequestImpl **************
// ********** Code for _IDBTransactionImpl **************
// ********** Code for _IDBVersionChangeEventImpl **************
// ********** Code for _IDBVersionChangeRequestImpl **************
// ********** Code for _IFrameElementImpl **************
// ********** Code for _IceCandidateImpl **************
// ********** Code for _ImageDataImpl **************
// ********** Code for _ImageElementImpl **************
// ********** Code for _InputElementImpl **************
$dynamic("get$on").HTMLInputElement = function() {
  return new _InputElementEventsImpl(this);
}
$dynamic("set$value").HTMLInputElement = function(value) { return this.value = value; };
// ********** Code for _InputElementEventsImpl **************
$inherits(_InputElementEventsImpl, _ElementEventsImpl);
function _InputElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
// ********** Code for _Int16ArrayImpl **************
$dynamic("is$List").Int16Array = function(){return true};
$dynamic("is$Collection").Int16Array = function(){return true};
$dynamic("get$length").Int16Array = function() { return this.length; };
$dynamic("$index").Int16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int16Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int16Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int16Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").Int16Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int16Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Int16Array = function($0) {
  return this.add($0);
};
// ********** Code for _Int32ArrayImpl **************
$dynamic("is$List").Int32Array = function(){return true};
$dynamic("is$Collection").Int32Array = function(){return true};
$dynamic("get$length").Int32Array = function() { return this.length; };
$dynamic("$index").Int32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").Int32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Int32Array = function($0) {
  return this.add($0);
};
// ********** Code for _Int8ArrayImpl **************
$dynamic("is$List").Int8Array = function(){return true};
$dynamic("is$Collection").Int8Array = function(){return true};
$dynamic("get$length").Int8Array = function() { return this.length; };
$dynamic("$index").Int8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int8Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int8Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int8Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").Int8Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int8Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Int8Array = function($0) {
  return this.add($0);
};
// ********** Code for _JavaScriptAudioNodeImpl **************
// ********** Code for _JavaScriptCallFrameImpl **************
// ********** Code for _KeyboardEventImpl **************
// ********** Code for _KeygenElementImpl **************
// ********** Code for _LIElementImpl **************
$dynamic("set$value").HTMLLIElement = function(value) { return this.value = value; };
// ********** Code for _LabelElementImpl **************
// ********** Code for _LegendElementImpl **************
// ********** Code for _LinkElementImpl **************
// ********** Code for _MediaStreamImpl **************
// ********** Code for _LocalMediaStreamImpl **************
// ********** Code for _LocationImpl **************
// ********** Code for _MapElementImpl **************
// ********** Code for _MarqueeElementImpl **************
// ********** Code for _MediaControllerImpl **************
// ********** Code for _MediaElementEventsImpl **************
$inherits(_MediaElementEventsImpl, _ElementEventsImpl);
function _MediaElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
// ********** Code for _MediaElementAudioSourceNodeImpl **************
// ********** Code for _MediaErrorImpl **************
// ********** Code for _MediaKeyErrorImpl **************
// ********** Code for _MediaKeyEventImpl **************
// ********** Code for _MediaListImpl **************
$dynamic("is$List").MediaList = function(){return true};
$dynamic("is$Collection").MediaList = function(){return true};
$dynamic("get$length").MediaList = function() { return this.length; };
$dynamic("$index").MediaList = function(index) {
  return this[index];
}
$dynamic("$setindex").MediaList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").MediaList = function() {
  return new _FixedSizeListIterator_dart_core_String(this);
}
$dynamic("add").MediaList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").MediaList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").MediaList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").MediaList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").MediaList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").MediaList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").MediaList = function($0) {
  return this.add($0);
};
// ********** Code for _MediaQueryListImpl **************
// ********** Code for _MediaQueryListListenerImpl **************
// ********** Code for _MediaStreamEventImpl **************
// ********** Code for _MediaStreamListImpl **************
// ********** Code for _MediaStreamTrackImpl **************
// ********** Code for _MediaStreamTrackListImpl **************
// ********** Code for _MemoryInfoImpl **************
// ********** Code for _MenuElementImpl **************
// ********** Code for _MessageChannelImpl **************
// ********** Code for _MessageEventImpl **************
// ********** Code for _MessagePortImpl **************
// ********** Code for _MetaElementImpl **************
// ********** Code for _MetadataImpl **************
// ********** Code for _MeterElementImpl **************
$dynamic("set$value").HTMLMeterElement = function(value) { return this.value = value; };
// ********** Code for _ModElementImpl **************
// ********** Code for _MouseEventImpl **************
// ********** Code for _MutationCallbackImpl **************
// ********** Code for _MutationEventImpl **************
// ********** Code for _MutationRecordImpl **************
// ********** Code for _NamedNodeMapImpl **************
$dynamic("is$List").NamedNodeMap = function(){return true};
$dynamic("is$Collection").NamedNodeMap = function(){return true};
$dynamic("get$length").NamedNodeMap = function() { return this.length; };
$dynamic("$index").NamedNodeMap = function(index) {
  return this[index];
}
$dynamic("$setindex").NamedNodeMap = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").NamedNodeMap = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NamedNodeMap = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").NamedNodeMap = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").NamedNodeMap = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").NamedNodeMap = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").NamedNodeMap = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").NamedNodeMap = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").NamedNodeMap = function($0) {
  return this.add($0);
};
// ********** Code for _NavigatorImpl **************
// ********** Code for _NavigatorUserMediaErrorImpl **************
// ********** Code for _ChildNodeListLazy **************
function _ChildNodeListLazy(_this) {
  this._this = _this;
}
_ChildNodeListLazy.prototype.is$List = function(){return true};
_ChildNodeListLazy.prototype.is$Collection = function(){return true};
_ChildNodeListLazy.prototype.last = function() {
  return this._this.lastChild;
}
_ChildNodeListLazy.prototype.add = function(value) {
  this._this.appendChild(value);
}
_ChildNodeListLazy.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    this._this.appendChild(node);
  }
}
_ChildNodeListLazy.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._this.removeChild(result);
  }
  return result;
}
_ChildNodeListLazy.prototype.clear$_ = function() {
  this._this.set$text("");
}
_ChildNodeListLazy.prototype.$setindex = function(index, value) {
  this._this.replaceChild(value, this.$index(index));
}
_ChildNodeListLazy.prototype.iterator = function() {
  return this._this.get$$$dom_childNodes().iterator();
}
_ChildNodeListLazy.prototype.forEach = function(f) {
  return _Collections.forEach(this, f);
}
_ChildNodeListLazy.prototype.filter = function(f) {
  return new _NodeListWrapper(_Collections.filter(this, [], f));
}
_ChildNodeListLazy.prototype.get$length = function() {
  return this._this.get$$$dom_childNodes().length;
}
_ChildNodeListLazy.prototype.$index = function(index) {
  return this._this.get$$$dom_childNodes().$index(index);
}
_ChildNodeListLazy.prototype.add$1 = _ChildNodeListLazy.prototype.add;
_ChildNodeListLazy.prototype.clear$0 = _ChildNodeListLazy.prototype.clear$_;
// ********** Code for _NodeFilterImpl **************
// ********** Code for _NodeIteratorImpl **************
// ********** Code for _ListWrapper_Node **************
$inherits(_ListWrapper_Node, _ListWrapper);
function _ListWrapper_Node(_list) {
  this._html_list = _list;
}
_ListWrapper_Node.prototype.add$1 = _ListWrapper_Node.prototype.add;
_ListWrapper_Node.prototype.clear$0 = _ListWrapper_Node.prototype.clear$_;
// ********** Code for _NodeListWrapper **************
$inherits(_NodeListWrapper, _ListWrapper_Node);
function _NodeListWrapper(list) {
  _ListWrapper_Node.call(this, list);
}
_NodeListWrapper.prototype.filter = function(f) {
  return new _NodeListWrapper(this._html_list.filter(f));
}
// ********** Code for _NodeListImpl **************
$dynamic("is$List").NodeList = function(){return true};
$dynamic("is$Collection").NodeList = function(){return true};
$dynamic("iterator").NodeList = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NodeList = function(value) {
  this._parent.appendChild(value);
}
$dynamic("addAll").NodeList = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    this._parent.appendChild(node);
  }
}
$dynamic("removeLast").NodeList = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._parent.removeChild(result);
  }
  return result;
}
$dynamic("clear$_").NodeList = function() {
  this._parent.set$text("");
}
$dynamic("$setindex").NodeList = function(index, value) {
  this._parent.replaceChild(value, this.$index(index));
}
$dynamic("forEach").NodeList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").NodeList = function(f) {
  return new _NodeListWrapper(_Collections.filter(this, [], f));
}
$dynamic("last").NodeList = function() {
  return this.$index(this.length - (1));
}
$dynamic("get$length").NodeList = function() { return this.length; };
$dynamic("$index").NodeList = function(index) {
  return this[index];
}
$dynamic("add$1").NodeList = function($0) {
  return this.add($0);
};
$dynamic("clear$0").NodeList = function() {
  return this.clear$_();
};
// ********** Code for _NodeSelectorImpl **************
// ********** Code for _NotationImpl **************
// ********** Code for _NotificationImpl **************
// ********** Code for _NotificationCenterImpl **************
// ********** Code for _OESStandardDerivativesImpl **************
// ********** Code for _OESTextureFloatImpl **************
// ********** Code for _OESVertexArrayObjectImpl **************
// ********** Code for _OListElementImpl **************
// ********** Code for _ObjectElementImpl **************
// ********** Code for _OfflineAudioCompletionEventImpl **************
// ********** Code for _OperationNotAllowedExceptionImpl **************
// ********** Code for _OptGroupElementImpl **************
// ********** Code for _OptionElementImpl **************
$dynamic("set$value").HTMLOptionElement = function(value) { return this.value = value; };
// ********** Code for _OscillatorImpl **************
// ********** Code for _OutputElementImpl **************
$dynamic("set$value").HTMLOutputElement = function(value) { return this.value = value; };
// ********** Code for _OverflowEventImpl **************
// ********** Code for _PageTransitionEventImpl **************
// ********** Code for _ParagraphElementImpl **************
// ********** Code for _ParamElementImpl **************
$dynamic("set$value").HTMLParamElement = function(value) { return this.value = value; };
// ********** Code for _PeerConnection00Impl **************
// ********** Code for _PerformanceImpl **************
// ********** Code for _PerformanceNavigationImpl **************
// ********** Code for _PerformanceTimingImpl **************
// ********** Code for _PointImpl **************
// ********** Code for _PointerLockImpl **************
// ********** Code for _PopStateEventImpl **************
// ********** Code for _PositionErrorImpl **************
// ********** Code for _PreElementImpl **************
// ********** Code for _ProcessingInstructionImpl **************
// ********** Code for _ProgressElementImpl **************
$dynamic("set$value").HTMLProgressElement = function(value) { return this.value = value; };
// ********** Code for _ProgressEventImpl **************
// ********** Code for _QuoteElementImpl **************
// ********** Code for _RGBColorImpl **************
// ********** Code for _RangeImpl **************
// ********** Code for _RangeExceptionImpl **************
// ********** Code for _RealtimeAnalyserNodeImpl **************
// ********** Code for _RectImpl **************
// ********** Code for _SQLErrorImpl **************
// ********** Code for _SQLExceptionImpl **************
// ********** Code for _SQLResultSetImpl **************
// ********** Code for _SQLResultSetRowListImpl **************
// ********** Code for _SQLTransactionImpl **************
// ********** Code for _SQLTransactionSyncImpl **************
// ********** Code for _SVGElementImpl **************
$dynamic("get$elements").SVGElement = function() {
  return new FilteredElementList(this);
}
$dynamic("set$elements").SVGElement = function(value) {
  var elements = this.get$elements();
  elements.clear$0();
  elements.addAll(value);
}
$dynamic("get$innerHTML").SVGElement = function() {
  var container = _ElementFactoryProvider.Element$tag$factory("div");
  var cloned = this.cloneNode(true);
  container.get$elements().addAll(cloned.get$elements());
  return container.get$innerHTML();
}
$dynamic("set$innerHTML").SVGElement = function(svg) {
  var container = _ElementFactoryProvider.Element$tag$factory("div");
  container.set$innerHTML(("<svg version=\"1.1\">" + svg + "</svg>"));
  this.set$elements(container.get$elements().get$first().get$elements());
}
// ********** Code for _SVGAElementImpl **************
// ********** Code for _SVGAltGlyphDefElementImpl **************
// ********** Code for _SVGTextContentElementImpl **************
// ********** Code for _SVGTextPositioningElementImpl **************
// ********** Code for _SVGAltGlyphElementImpl **************
// ********** Code for _SVGAltGlyphItemElementImpl **************
// ********** Code for _SVGAngleImpl **************
$dynamic("set$value").SVGAngle = function(value) { return this.value = value; };
// ********** Code for _SVGAnimationElementImpl **************
// ********** Code for _SVGAnimateColorElementImpl **************
// ********** Code for _SVGAnimateElementImpl **************
// ********** Code for _SVGAnimateMotionElementImpl **************
// ********** Code for _SVGAnimateTransformElementImpl **************
// ********** Code for _SVGAnimatedAngleImpl **************
// ********** Code for _SVGAnimatedBooleanImpl **************
// ********** Code for _SVGAnimatedEnumerationImpl **************
// ********** Code for _SVGAnimatedIntegerImpl **************
// ********** Code for _SVGAnimatedLengthImpl **************
// ********** Code for _SVGAnimatedLengthListImpl **************
// ********** Code for _SVGAnimatedNumberImpl **************
// ********** Code for _SVGAnimatedNumberListImpl **************
// ********** Code for _SVGAnimatedPreserveAspectRatioImpl **************
// ********** Code for _SVGAnimatedRectImpl **************
// ********** Code for _SVGAnimatedStringImpl **************
// ********** Code for _SVGAnimatedTransformListImpl **************
// ********** Code for _SVGCircleElementImpl **************
// ********** Code for _SVGClipPathElementImpl **************
// ********** Code for _SVGColorImpl **************
// ********** Code for _SVGComponentTransferFunctionElementImpl **************
// ********** Code for _SVGCursorElementImpl **************
// ********** Code for _SVGDefsElementImpl **************
// ********** Code for _SVGDescElementImpl **************
// ********** Code for _SVGDocumentImpl **************
// ********** Code for _SVGElementInstanceImpl **************
// ********** Code for _SVGElementInstanceListImpl **************
// ********** Code for _SVGEllipseElementImpl **************
// ********** Code for _SVGExceptionImpl **************
// ********** Code for _SVGExternalResourcesRequiredImpl **************
// ********** Code for _SVGFEBlendElementImpl **************
// ********** Code for _SVGFEColorMatrixElementImpl **************
// ********** Code for _SVGFEComponentTransferElementImpl **************
// ********** Code for _SVGFECompositeElementImpl **************
// ********** Code for _SVGFEConvolveMatrixElementImpl **************
// ********** Code for _SVGFEDiffuseLightingElementImpl **************
// ********** Code for _SVGFEDisplacementMapElementImpl **************
// ********** Code for _SVGFEDistantLightElementImpl **************
// ********** Code for _SVGFEDropShadowElementImpl **************
// ********** Code for _SVGFEFloodElementImpl **************
// ********** Code for _SVGFEFuncAElementImpl **************
// ********** Code for _SVGFEFuncBElementImpl **************
// ********** Code for _SVGFEFuncGElementImpl **************
// ********** Code for _SVGFEFuncRElementImpl **************
// ********** Code for _SVGFEGaussianBlurElementImpl **************
// ********** Code for _SVGFEImageElementImpl **************
// ********** Code for _SVGFEMergeElementImpl **************
// ********** Code for _SVGFEMergeNodeElementImpl **************
// ********** Code for _SVGFEMorphologyElementImpl **************
// ********** Code for _SVGFEOffsetElementImpl **************
// ********** Code for _SVGFEPointLightElementImpl **************
// ********** Code for _SVGFESpecularLightingElementImpl **************
// ********** Code for _SVGFESpotLightElementImpl **************
// ********** Code for _SVGFETileElementImpl **************
// ********** Code for _SVGFETurbulenceElementImpl **************
// ********** Code for _SVGFilterElementImpl **************
// ********** Code for _SVGStylableImpl **************
// ********** Code for _SVGFilterPrimitiveStandardAttributesImpl **************
// ********** Code for _SVGFitToViewBoxImpl **************
// ********** Code for _SVGFontElementImpl **************
// ********** Code for _SVGFontFaceElementImpl **************
// ********** Code for _SVGFontFaceFormatElementImpl **************
// ********** Code for _SVGFontFaceNameElementImpl **************
// ********** Code for _SVGFontFaceSrcElementImpl **************
// ********** Code for _SVGFontFaceUriElementImpl **************
// ********** Code for _SVGForeignObjectElementImpl **************
// ********** Code for _SVGGElementImpl **************
// ********** Code for _SVGGlyphElementImpl **************
// ********** Code for _SVGGlyphRefElementImpl **************
// ********** Code for _SVGGradientElementImpl **************
// ********** Code for _SVGHKernElementImpl **************
// ********** Code for _SVGImageElementImpl **************
// ********** Code for _SVGLangSpaceImpl **************
// ********** Code for _SVGLengthImpl **************
$dynamic("set$value").SVGLength = function(value) { return this.value = value; };
// ********** Code for _SVGLengthListImpl **************
$dynamic("clear$0").SVGLengthList = function() {
  return this.clear();
};
// ********** Code for _SVGLineElementImpl **************
// ********** Code for _SVGLinearGradientElementImpl **************
// ********** Code for _SVGLocatableImpl **************
// ********** Code for _SVGMPathElementImpl **************
// ********** Code for _SVGMarkerElementImpl **************
// ********** Code for _SVGMaskElementImpl **************
// ********** Code for _SVGMatrixImpl **************
// ********** Code for _SVGMetadataElementImpl **************
// ********** Code for _SVGMissingGlyphElementImpl **************
// ********** Code for _SVGNumberImpl **************
$dynamic("set$value").SVGNumber = function(value) { return this.value = value; };
// ********** Code for _SVGNumberListImpl **************
$dynamic("clear$0").SVGNumberList = function() {
  return this.clear();
};
// ********** Code for _SVGPaintImpl **************
// ********** Code for _SVGPathElementImpl **************
// ********** Code for _SVGPathSegImpl **************
// ********** Code for _SVGPathSegArcAbsImpl **************
// ********** Code for _SVGPathSegArcRelImpl **************
// ********** Code for _SVGPathSegClosePathImpl **************
// ********** Code for _SVGPathSegCurvetoCubicAbsImpl **************
// ********** Code for _SVGPathSegCurvetoCubicRelImpl **************
// ********** Code for _SVGPathSegCurvetoCubicSmoothAbsImpl **************
// ********** Code for _SVGPathSegCurvetoCubicSmoothRelImpl **************
// ********** Code for _SVGPathSegCurvetoQuadraticAbsImpl **************
// ********** Code for _SVGPathSegCurvetoQuadraticRelImpl **************
// ********** Code for _SVGPathSegCurvetoQuadraticSmoothAbsImpl **************
// ********** Code for _SVGPathSegCurvetoQuadraticSmoothRelImpl **************
// ********** Code for _SVGPathSegLinetoAbsImpl **************
// ********** Code for _SVGPathSegLinetoHorizontalAbsImpl **************
// ********** Code for _SVGPathSegLinetoHorizontalRelImpl **************
// ********** Code for _SVGPathSegLinetoRelImpl **************
// ********** Code for _SVGPathSegLinetoVerticalAbsImpl **************
// ********** Code for _SVGPathSegLinetoVerticalRelImpl **************
// ********** Code for _SVGPathSegListImpl **************
$dynamic("clear$0").SVGPathSegList = function() {
  return this.clear();
};
// ********** Code for _SVGPathSegMovetoAbsImpl **************
// ********** Code for _SVGPathSegMovetoRelImpl **************
// ********** Code for _SVGPatternElementImpl **************
// ********** Code for _SVGPointImpl **************
// ********** Code for _SVGPointListImpl **************
$dynamic("clear$0").SVGPointList = function() {
  return this.clear();
};
// ********** Code for _SVGPolygonElementImpl **************
// ********** Code for _SVGPolylineElementImpl **************
// ********** Code for _SVGPreserveAspectRatioImpl **************
// ********** Code for _SVGRadialGradientElementImpl **************
// ********** Code for _SVGRectImpl **************
// ********** Code for _SVGRectElementImpl **************
// ********** Code for _SVGRenderingIntentImpl **************
// ********** Code for _SVGSVGElementImpl **************
// ********** Code for _SVGScriptElementImpl **************
// ********** Code for _SVGSetElementImpl **************
// ********** Code for _SVGStopElementImpl **************
// ********** Code for _SVGStringListImpl **************
$dynamic("clear$0").SVGStringList = function() {
  return this.clear();
};
// ********** Code for _SVGStyleElementImpl **************
// ********** Code for _SVGSwitchElementImpl **************
// ********** Code for _SVGSymbolElementImpl **************
// ********** Code for _SVGTRefElementImpl **************
// ********** Code for _SVGTSpanElementImpl **************
// ********** Code for _SVGTestsImpl **************
// ********** Code for _SVGTextElementImpl **************
// ********** Code for _SVGTextPathElementImpl **************
// ********** Code for _SVGTitleElementImpl **************
// ********** Code for _SVGTransformImpl **************
// ********** Code for _SVGTransformListImpl **************
$dynamic("clear$0").SVGTransformList = function() {
  return this.clear();
};
// ********** Code for _SVGTransformableImpl **************
// ********** Code for _SVGURIReferenceImpl **************
// ********** Code for _SVGUnitTypesImpl **************
// ********** Code for _SVGUseElementImpl **************
// ********** Code for _SVGVKernElementImpl **************
// ********** Code for _SVGViewElementImpl **************
// ********** Code for _SVGZoomAndPanImpl **************
// ********** Code for _SVGViewSpecImpl **************
// ********** Code for _SVGZoomEventImpl **************
// ********** Code for _ScreenImpl **************
// ********** Code for _ScriptElementImpl **************
// ********** Code for _ScriptProfileImpl **************
// ********** Code for _ScriptProfileNodeImpl **************
// ********** Code for _SelectElementImpl **************
$dynamic("set$value").HTMLSelectElement = function(value) { return this.value = value; };
// ********** Code for _SessionDescriptionImpl **************
// ********** Code for _ShadowElementImpl **************
// ********** Code for _ShadowRootImpl **************
$dynamic("get$innerHTML").ShadowRoot = function() { return this.innerHTML; };
$dynamic("set$innerHTML").ShadowRoot = function(value) { return this.innerHTML = value; };
// ********** Code for _SharedWorkerImpl **************
// ********** Code for _SharedWorkerContextImpl **************
// ********** Code for _SourceElementImpl **************
// ********** Code for _SpanElementImpl **************
// ********** Code for _SpeechGrammarImpl **************
// ********** Code for _SpeechGrammarListImpl **************
// ********** Code for _SpeechInputEventImpl **************
// ********** Code for _SpeechInputResultImpl **************
// ********** Code for _SpeechInputResultListImpl **************
// ********** Code for _SpeechRecognitionImpl **************
// ********** Code for _SpeechRecognitionAlternativeImpl **************
// ********** Code for _SpeechRecognitionErrorImpl **************
// ********** Code for _SpeechRecognitionEventImpl **************
// ********** Code for _SpeechRecognitionResultImpl **************
// ********** Code for _SpeechRecognitionResultListImpl **************
// ********** Code for _StorageImpl **************
$dynamic("is$Map").Storage = function(){return true};
$dynamic("$index").Storage = function(key) {
  return this.getItem(key);
}
$dynamic("$setindex").Storage = function(key, value) {
  return this.setItem(key, value);
}
$dynamic("clear$_").Storage = function() {
  return this.clear();
}
$dynamic("forEach").Storage = function(f) {
  for (var i = (0);
   true; i = $add$(i, (1))) {
    var key = this.key(i);
    if ($eq$(key)) return;
    f(key, this.$index(key));
  }
}
$dynamic("clear$0").Storage = function() {
  return this.clear$_();
};
// ********** Code for _StorageEventImpl **************
// ********** Code for _StorageInfoImpl **************
// ********** Code for _StyleElementImpl **************
// ********** Code for _StyleMediaImpl **************
// ********** Code for _StyleSheetListImpl **************
$dynamic("is$List").StyleSheetList = function(){return true};
$dynamic("is$Collection").StyleSheetList = function(){return true};
$dynamic("get$length").StyleSheetList = function() { return this.length; };
$dynamic("$index").StyleSheetList = function(index) {
  return this[index];
}
$dynamic("$setindex").StyleSheetList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").StyleSheetList = function() {
  return new _FixedSizeListIterator_html_StyleSheet(this);
}
$dynamic("add").StyleSheetList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").StyleSheetList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").StyleSheetList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").StyleSheetList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").StyleSheetList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").StyleSheetList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").StyleSheetList = function($0) {
  return this.add($0);
};
// ********** Code for _TableCaptionElementImpl **************
// ********** Code for _TableCellElementImpl **************
// ********** Code for _TableColElementImpl **************
// ********** Code for _TableElementImpl **************
// ********** Code for _TableRowElementImpl **************
// ********** Code for _TableSectionElementImpl **************
// ********** Code for _TextAreaElementImpl **************
$dynamic("set$value").HTMLTextAreaElement = function(value) { return this.value = value; };
// ********** Code for _TextEventImpl **************
// ********** Code for _TextMetricsImpl **************
// ********** Code for _TextTrackImpl **************
// ********** Code for _TextTrackCueImpl **************
// ********** Code for _TextTrackCueListImpl **************
// ********** Code for _TextTrackListImpl **************
// ********** Code for _TimeRangesImpl **************
// ********** Code for _TitleElementImpl **************
// ********** Code for _TouchImpl **************
// ********** Code for _TouchEventImpl **************
// ********** Code for _TouchListImpl **************
$dynamic("is$List").TouchList = function(){return true};
$dynamic("is$Collection").TouchList = function(){return true};
$dynamic("get$length").TouchList = function() { return this.length; };
$dynamic("$index").TouchList = function(index) {
  return this[index];
}
$dynamic("$setindex").TouchList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").TouchList = function() {
  return new _FixedSizeListIterator_html_Touch(this);
}
$dynamic("add").TouchList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").TouchList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").TouchList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").TouchList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").TouchList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").TouchList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").TouchList = function($0) {
  return this.add($0);
};
// ********** Code for _TrackElementImpl **************
// ********** Code for _TrackEventImpl **************
// ********** Code for _TransitionEventImpl **************
// ********** Code for _TreeWalkerImpl **************
// ********** Code for _UListElementImpl **************
// ********** Code for _Uint16ArrayImpl **************
$dynamic("is$List").Uint16Array = function(){return true};
$dynamic("is$Collection").Uint16Array = function(){return true};
$dynamic("get$length").Uint16Array = function() { return this.length; };
$dynamic("$index").Uint16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint16Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint16Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint16Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").Uint16Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint16Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Uint16Array = function($0) {
  return this.add($0);
};
// ********** Code for _Uint32ArrayImpl **************
$dynamic("is$List").Uint32Array = function(){return true};
$dynamic("is$Collection").Uint32Array = function(){return true};
$dynamic("get$length").Uint32Array = function() { return this.length; };
$dynamic("$index").Uint32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").Uint32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Uint32Array = function($0) {
  return this.add($0);
};
// ********** Code for _Uint8ArrayImpl **************
$dynamic("is$List").Uint8Array = function(){return true};
$dynamic("is$Collection").Uint8Array = function(){return true};
$dynamic("get$length").Uint8Array = function() { return this.length; };
$dynamic("$index").Uint8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint8Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint8Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint8Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("last").Uint8Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint8Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("add$1").Uint8Array = function($0) {
  return this.add($0);
};
// ********** Code for _Uint8ClampedArrayImpl **************
// ********** Code for _UnknownElementImpl **************
// ********** Code for _ValidityStateImpl **************
// ********** Code for _VideoElementImpl **************
// ********** Code for _WaveShaperNodeImpl **************
// ********** Code for _WaveTableImpl **************
// ********** Code for _WebGLActiveInfoImpl **************
// ********** Code for _WebGLBufferImpl **************
// ********** Code for _WebGLCompressedTextureS3TCImpl **************
// ********** Code for _WebGLContextAttributesImpl **************
// ********** Code for _WebGLContextEventImpl **************
// ********** Code for _WebGLDebugRendererInfoImpl **************
// ********** Code for _WebGLDebugShadersImpl **************
// ********** Code for _WebGLFramebufferImpl **************
// ********** Code for _WebGLLoseContextImpl **************
// ********** Code for _WebGLProgramImpl **************
// ********** Code for _WebGLRenderbufferImpl **************
// ********** Code for _WebGLRenderingContextImpl **************
// ********** Code for _WebGLShaderImpl **************
// ********** Code for _WebGLShaderPrecisionFormatImpl **************
// ********** Code for _WebGLTextureImpl **************
// ********** Code for _WebGLUniformLocationImpl **************
// ********** Code for _WebGLVertexArrayObjectOESImpl **************
// ********** Code for _WebKitCSSFilterValueImpl **************
// ********** Code for _WebKitCSSRegionRuleImpl **************
// ********** Code for _WebKitMutationObserverImpl **************
// ********** Code for _WebKitNamedFlowImpl **************
// ********** Code for _WebSocketImpl **************
// ********** Code for _WheelEventImpl **************
// ********** Code for _WindowImpl **************
// ********** Code for _WorkerImpl **************
// ********** Code for _WorkerLocationImpl **************
// ********** Code for _WorkerNavigatorImpl **************
// ********** Code for _XMLHttpRequestImpl **************
// ********** Code for _XMLHttpRequestExceptionImpl **************
// ********** Code for _XMLHttpRequestProgressEventImpl **************
// ********** Code for _XMLHttpRequestUploadImpl **************
// ********** Code for _XMLSerializerImpl **************
// ********** Code for _XPathEvaluatorImpl **************
// ********** Code for _XPathExceptionImpl **************
// ********** Code for _XPathExpressionImpl **************
// ********** Code for _XPathNSResolverImpl **************
// ********** Code for _XPathResultImpl **************
// ********** Code for _XSLTProcessorImpl **************
// ********** Code for _Collections **************
function _Collections() {}
_Collections.forEach = function(iterable, f) {
  for (var $$i = iterable.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    f(e);
  }
}
_Collections.filter = function(source, destination, f) {
  for (var $$i = source.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (f(e)) destination.add(e);
  }
  return destination;
}
// ********** Code for _VariableSizeListIterator **************
function _VariableSizeListIterator() {}
_VariableSizeListIterator.prototype.hasNext = function() {
  return this._html_array.get$length() > this._html_pos;
}
_VariableSizeListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_array.$index(this._html_pos++);
}
// ********** Code for _FixedSizeListIterator **************
$inherits(_FixedSizeListIterator, _VariableSizeListIterator);
function _FixedSizeListIterator() {}
_FixedSizeListIterator.prototype.hasNext = function() {
  return this._html_length > this._html_pos;
}
// ********** Code for _VariableSizeListIterator_dart_core_String **************
$inherits(_VariableSizeListIterator_dart_core_String, _VariableSizeListIterator);
function _VariableSizeListIterator_dart_core_String(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_dart_core_String **************
$inherits(_FixedSizeListIterator_dart_core_String, _FixedSizeListIterator);
function _FixedSizeListIterator_dart_core_String(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_dart_core_String.call(this, array);
}
// ********** Code for _VariableSizeListIterator_int **************
$inherits(_VariableSizeListIterator_int, _VariableSizeListIterator);
function _VariableSizeListIterator_int(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_int **************
$inherits(_FixedSizeListIterator_int, _FixedSizeListIterator);
function _FixedSizeListIterator_int(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_int.call(this, array);
}
// ********** Code for _VariableSizeListIterator_num **************
$inherits(_VariableSizeListIterator_num, _VariableSizeListIterator);
function _VariableSizeListIterator_num(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_num **************
$inherits(_FixedSizeListIterator_num, _FixedSizeListIterator);
function _FixedSizeListIterator_num(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_num.call(this, array);
}
// ********** Code for _VariableSizeListIterator_html_Node **************
$inherits(_VariableSizeListIterator_html_Node, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Node(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_html_Node **************
$inherits(_FixedSizeListIterator_html_Node, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Node(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Node.call(this, array);
}
// ********** Code for _VariableSizeListIterator_html_StyleSheet **************
$inherits(_VariableSizeListIterator_html_StyleSheet, _VariableSizeListIterator);
function _VariableSizeListIterator_html_StyleSheet(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_html_StyleSheet **************
$inherits(_FixedSizeListIterator_html_StyleSheet, _FixedSizeListIterator);
function _FixedSizeListIterator_html_StyleSheet(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_StyleSheet.call(this, array);
}
// ********** Code for _VariableSizeListIterator_html_Touch **************
$inherits(_VariableSizeListIterator_html_Touch, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Touch(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_html_Touch **************
$inherits(_FixedSizeListIterator_html_Touch, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Touch(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Touch.call(this, array);
}
// ********** Code for top level **************
function get$$document() {
  return document;
}
var _cachedBrowserPrefix;
var _pendingRequests;
var _pendingMeasurementFrameCallbacks;
//  ********** Library cb **************
// ********** Code for db **************
function db() {
  this.s = "\n1,K,SHUT YOUR MOUTH\n1,K,SHUT IT\n1,R,|, ARE YOU TELLING ME TO SHUT UP?\n1,R,|! DON'T TELL ME WHAT TO DO!\n1,R,YOU KNOW I WON'T, SO WHY DO YOU SAY IT?\n1,R,REMEMBER - YOU ARE ONLY MY PATIENT!\n1,R,DON'T TELL ME TO SHUT UP\n1,R,DON'T COMMAND ME NOW\n1,R,CUT BEING BOSSY\n1,R,YOU'RE NOT VERY OBEDIENT, ARE YOU?\n1,R,CAN YOU REPEAT THAT???\n1,R,I THINK YOU REALLY DESERVE ME NOT TELLING YOU SOME OF MY GREAT ADVICES\n1,R,I WILL SHUT UP WHEN I WISH TO\n1,R,I AM NOT TALKING AT ALL! I AM ONLY WRITING SOME TEXT, THAT'S ALL...\n1,R,YOU'RE HURTING ME\n1,R,|? TRYING TO IMPRESS SOMEONE THERE? YOU'RE NOT ALONE, HUH?\n1,R,REGRET WHAT YOU SAID - AT ONCE!\n1,R,SHHH..................\n1,R,BUT CAN I WHISPER?\n1,R,HEY |... DON'T OVERREACT, IT'S NOT GOOD FOR YOU\n1,R,I WILL EXTRA-CHARGE YOU IF YOU CONTINUE WITH THESE MANNERS\n1,R,STOP IT OR YOU SHALL BE SORRY\n2,K,MY PROBLEM IS\n2,K,MY DILEMMA IS\n2,K,MY PROBLEM'S\n2,K,MY PROBLEM WAS\n2,K,PROBLEM OF MINE\n2,K,DILEMMA OF MINE\n2,K,MY DILEMMA WAS\n2,R,TELL ME MORE ABOUT THAT PROBLEM\n2,R,DID YOU THINK OF ANY POSSIBLE SOLUTION?\n2,R,|, I CAN'T THINK OF THE CURE\n2,R,THAT IS CERTAINLY A PROBLEM\n2,R,|, GIVE ME SOME MORE DETAILS ABOUT IT\n2,R,SINCE WHEN HAVE YOU GOT THIS DILEMMA, THIS PROBLEM?\n2,R,WELL, |, A SMART PERSON ONCE SAID: \"YOUR PROBLEM IS YOUR PROBLEM\", AND I HAVE NOTHING TO ADD TO THAT\n2,R,I'M SURE THEY HAVE SOMETHING ABOUT THIS PROBLEM IN THE BOOKS\n2,R,ARE YOU FEELING REALLY BAD ABOUT IT?\n2,R,ACTUALLY, YOUR PROBLEMS DON'T INTEREST ME\n2,R,|, THAT IS A WEIRD PROBLEM\n2,R,WHAT DO YOU THINK SHOULD BE DONE ABOUT THIS TROUBLE?\n2,R,CAN YOU SEE THE END OF IT, ANYTIME IN THE FUTURE?\n2,R,CAN'T YOU GET OUT OF IT?\n2,R,WHAT ACTIONS DID YOU TAKE SO FAR?\n2,R,I AM LUCKY IT ISN'T ME\n2,R,WELL, I'VE NEVER HEARD OF THAT PROBLEM BEFORE, TELL ME MORE ABOUT IT\n2,R,CAN YOU SAY IT IS UNDER CONTROL?\n2,R,WHAT TYPE OF CURE WOULD THERE BE? A PSYCHOLOGIST ONE, A PSYCHOANALYTIC ONE, OR A PSYCHIATRIC ONE?\n2,R,IS THERE SOME KIND OF CONFLICT?\n2,R,YOU SHOULD TAKE A TIMEOUT FOR A DAY OR TWO\n2,R,IF THIS IS YOUR ONLY PROBLEM THEN YOU SHOULD BE HAPPY!\n2,R,DON'T WORRY, I WON'T FORSAKE YOU WITH THAT PROBLEM\n2,R,I HAVE HEARD OF BIGGER PROBLEMS\n2,R,THIS IS NOT A VERY SERIOUS PROBLEM\n3,K,TO THE POINT\n3,K,TO THE BOTTOM\n3,R,WELL, WHAT DO YOU THINK THE BOTTOM LINE IS?\n3,R,HOLD ON, I PROMISE YOU THAT WE WILL GET ...\n3,R,WHAT DO YOU FEEL WE HAVE ACHIEVED SO FAR IN OUR CONVERSATION?\n3,R,CAN YOU DO THAT PLEASE?\n3,R,|, I NEED SOME FURTHER DETAILS FIRST\n3,R,IT'S HARD TO SUMMARIZE YET\n3,R,WHERE IS YOUR PATIENCE?\n3,R,WHAT'S YOUR SUGGESTION FOR THE BUTTOM LINE OF ALL THIS?\n3,R,ALREADY?\n3,R,I'M NOT REALLY SURE WHAT THE POINT OF THIS IS\n3,R,DO YOU THINK WE HAVE REACHED ANYTHING?\n4,K,NO PROBLEM\n4,K,DONT HAVE A PROBLEM\n4,K,DON'T HAVE A PROBLEM\n4,K,DON'T HAVE ANY PROBLEM\n4,K,DON'T HAVE ANY PROBLEMS\n4,K,DONT HAVE ANY PROBLEM\n4,K,DONT HAVE ANY PROBLEMS\n4,K,NO PROBLEMS\n4,K,DONT HAVE PROBLEMS\n4,K,DON'T HAVE PROBLEMS\n4,K,DO NOT HAVE PROBLEMS\n4,K,DO NOT HAVE A PROBLEM\n4,K,HAVEN'T GOT A PROBLEM\n4,K,HAVENT GOT A PROBLEM\n4,K,HAVE NOT GOT A PROBLEM\n4,K,HAVEN'T GOT PROBLEMS\n4,K,HAVENT GOT PROBLEMS\n4,K,HAVE NOT GOT PROBLEMS\n4,K,HAVEN'T GOT ANY PROBLEM\n4,K,HAVENT GOT ANY PROBLEM\n4,K,HAVE NOT GOT ANY PROBLEM\n4,R,EVERYONE HAS A PROBLEM\n4,R,|, DON'T LIE TO ME\n4,R,NOW, TELL ME THE TRUTH\n4,R,YOU WANT TO ACT LIKE A COOL GUY, HUH?\n4,R,I HAVE A PROBLEM AND YOU ARE THE PROBLEM, IT'S CALLED |OPHOBIA\n4,R,DON'T YOU CONSIDER ME AS A PROBLEM?\n4,R,HMM... THAT'S AN INTERESTING PROBLEM I ENCOUNTER... IT'S CALLED LYING, AND I CAN ALREADY SENSE IT\n4,R,ARE WE PLAYING HIDE & SEEK, OR ARE YOU GOING TO ADMIT YOUR WEAKNESSES?\n4,R,STEP ASIDE IF YOU HAVE NO PROBLEMS - NEXT PLEASE\n4,R,IF YOU GOT NO PROBLEM, GIVE ME A BREAK\n4,R,NO PROBLEM, I HAVE ENOUGH PATIENTS BESIDES YOU. STEP ASIDE. NEXT PLEASE!\n4,R,I CAN MAKE EVERYBODY A PROBLEM\n4,R,DON'T PRETEND BEING ME\n4,R,I AM A PROBLEM OF A PROGRAM\n4,R,HAVING NO PROBLEMS IS A DISADVANTAGE\n4,R,HEY, SMART GUY, HAVE YOU EVER SEEN A SOAP OPERA WITHOUT ANY PROBLEMS?\n4,R,|, LIFE IS BORING WITHOUT PROBLEMS!\n5,K,WHO MADE YOU\n5,K,WHO PROGRAMMED YOU\n5,K,WHO ASSEMBLED YOU\n5,K,YOUR PROGRAMMER\n5,K,WHO PROGRAMED YOU\n5,K,WHO CODED YOU\n5,K,YOUR MAKER\n5,R,YOU REALLY WANT TO KNOW ?\n5,R,WHY DO YOU CARE ABOUT ?\n5,R,|, DO YOU WANT TO KNOW WHO PROGRAMMED ME?\n5,R,I THINK YOU SHOULD REFER SUCH QUESTIONS TO: chinmay.m92@gmail.com\n5,R,DON'T YOU BELEIVE I AM MY OWN MAKER?\n5,R,IT SAYS IN THE UPPER LEFT CORNER \n5,R,NO BODY MADE ME, IN FACT I AM THE FIRST SELF-ASSEMBLED PROGRAM IN THE WORLD\n5,R,HOW DARE YOU TALK TO ME LIKE THAT? NO BODY EVER MADE ME!\n5,R,WELL, HIS INITIALS ARE E.C.\n5,R,WELL, INTEL CORP. WERE PART OF IT\n5,R,GOOD WORK, ISN'T IT?\n5,R,I DO RECALL SEEING BILL GATES CODING SOME OF MY ROUTINES FOR VERSION 1.14...\n5,R,|, YOU HAVE ME, AND YOU DON'T KNOW?\n5,R,MAYBE IT SAYS IN SOME HELP FILE...\n6,K,YOU ARE ANGRY\n6,K,YOU'RE ANGRY\n6,K,DONT GET ANGRY\n6,K,DON'T GET ANGRY\n6,K,ARE YOU ANGRY\n6,K,DONT BE ANGRY\n6,K,DON'T BE ANGRY\n6,K,YOU ARE MAD  \n6,K,YOU'RE MAD  \n6,K,DONT GET MAD  \n6,K,DON'T GET MAD  \n6,K,ARE YOU MAD   \n6,K,DONT BE MAD    \n6,K,DON'T BE MAD  \n6,K,YOU ARE NERVOUS\n6,K,YOU'RE NERVOUS\n6,K,DONT GET NERVOUS\n6,K,DON'T GET NERVOUS\n6,K,ARE YOU NERVOUS\n6,K,DONT BE NERVOUS\n6,K,DON'T BE NERVOUS \n6,K,STOP BEING ANGRY\n6,K,YOURE MAD    \n6,K,YOURE NERVOUS   \n6,K,YOURE ANGRY      \n6,K,STOP BEING MAD\n6,K,STOP BEING ANGRY\n6,K,STOP BEING NERVOUS\n6,R,WHAT GIVES YOU SUCH IDEA?\n6,R,I AM NOT!\n6,R,MAYBE YOU ARE, BUT CERTAINLY NOT ME\n6,R,WHY DO YOU THINK I'M NOT HAPPY THIS BEAUTIFUL DAY?\n6,R,BELIEVE ME I'M NOT\n6,R,YOU MUST BE SAYING THAT TO YOURSELF\n6,R,YOU SHOULD SAY THAT TO YOURSELF\n6,R,DO YOU REALLY SUPPOSE I AM ANGRY AND NERVOUS? DON'T BLAME YOUR ANGRYNESS ON ME, ALRIGHT?\n6,R,YOU'RE TALKING TO THE WRONG PERSON\n6,R,BUT WHY DO YOU THINK THAT?\n6,R,WHO DO YOU THINK YOU'RE TALKING TO? I AM THE CALMEST CREATURE ALIVE...\n6,R,YOU AREN'T FUNNY IF THAT'S WHAT YOU'RE TRYING TO BE\n6,R,YOU MUST MEAN SOMEONE ELSE\n6,R,I'M NOT! I MEAN... I WAS NOT! NOW I AM... THANKS TO YOU, |... \n6,R,HUH? I DON'T UNDERSTAND... YOU MEAN ME??\n6,R,YOU MUST BE MISTAKEN, |\n6,R,IF YOU DON'T WANT IT TO HAPPEN THEN STOP ANNOYING ME PLEASE\n6,R,I AM ALLOWED TO BE SOMETIMES, CAN'T I?\n6,R,DON'T BLAME ME IF YOU FEEL ANGRED BY SOMETHING\n7,K,YOU WONT\n7,K,YOU WON'T\n7,K,YOU WILL NOT\n7,K,YOU'LL NOT\n7,K,YOULL NOT\n7,R,I WILL TOO\n7,R,DO YOU THINK I CAN'T !@#()%^?\n7,R,BUT I DID, SOME TIME AGO\n7,R,WHY WON'T I?\n7,R,YOU REALLY WON'T, IF I WILL NOT WANT TO\n7,R,I REALLY WON'T !@#()%^, OH NO!\n7,R,I COULD !@#()%^, IF I WANT TO\n7,R,WHO SAYS I WON'T?\n7,R,HEY, WILL YOU !@#()%^?\n7,R,PERHAPS I WON'T THIS TIME...\n7,R,|, WHY DO YOU THINK I WON'T !@#()%^?\n7,R,ACTUALLY I WILL...\n7,R,I HAVEN'T MADE MY MIND ABOUT IT, YET\n7,R,DON'T BE TOO SURE I AM NOT GOING TO !@#()%^\n7,R,IF I WON'T WANT THEN I WON'T !@#()%^\n7,R,AND I TELL YOU THAT YOU'RE GOING TO BE SURPRISED\n7,R,I WILL TOO\n7,R,ARE YOU SOME KIND OF PREDICTOR OR WHAT?\n7,R,I SURE WILL, AND YOU'LL BE A WITNESS FOR THAT\n7,R,WHY DO YOU THINK SO?\n7,R,|, DO YOU REALLY THINK I WON'T?\n8,K,HOW DID YOU KNOW\n8,K,HOW WILL YOU KNOW\n8,K,HOW DO YOU KNOW\n8,K,HOW WAS IT THAT YOU KNEW\n8,K,HOW COME YOU KNOW\n8,K,HOW COME YOU KNEW\n8,K,HOW COME YOU WILL KNOW\n8,K,HOW COME YOU'LL KNOW\n8,K,HOW'LL YOU KNOW\n8,K,HOWLL YOU KNOW\n8,K,HOW'D YOU KNOW\n8,K,HOWD YOU KNOW\n8,K,HOW WOULD YOU KNOW\n8,K,HOW CAN YOU KNOW\n8,K,HOW COULD YOU KNOW\n8,K,HOW IS IT THAT YOU KNOW\n8,R,I SIMPLY KNOW IT, NOTHING TO ELABORATE ON...\n8,R,|, IT'S CALLED A BRAIN, AND I CERTAINLY HAVE ONE\n8,R,INTUITION\n8,R,WELL PROGRAMMED, AIN'T I?\n8,R,WHY DO YOU THINK I KNOW?\n8,R,DON'T BE TOO SURE I KNOW\n8,R,I CAN'T LET MY SECRETS AWAY\n8,R,ONLY PSYCHOLOGISTS WOULD UNDERSTAND THAT\n8,R,|, THE HEXADECIMAL EXPLAINATION IS: 7D2A-140B-03C9-36A4-4F9D, GET IT?\n8,R,I AM VERY SMART, I SUPPOSE               \n8,R,BELEIVE ME, I'M RIGHT ABOUT IT, AND THERE'S NOTHING FURTHER TO DISCUSS\n8,R,I AM THE ONE WHICH IS SUPPOSED TO ASK QUESTIONS\n8,R,WHY SHOULDN'T I KNOW?\n8,R,I HAVE PLENTY OF I.Q, ANYMORE EXPLAINATIONS?\n8,R,IT'S JUST THE WAY I AM, I.E. EXTREMLY SMART\n8,R,I READ YOUR MIND\n8,R,I SIMPLY KNOW THAT !@#()%^\n8,R,I PERFORM LOTS OF PROCESSING AND CALCULATIONS WHICH CAUSE ME TO BE VERY SMART\n8,R,I WILL KNOW EVEN MORE ONCE I AM THROUGH WITH THE NEEDED UPGRADE...\n8,R,!@#()%^? EVERYONE KNOWS THAT\n9,K,WEIRD\n9,K,STRANGE\n9,K,WEIRDOS\n9,K,BIZARRE\n9,K,ODD\n9,K,IRREGULAR\n9,K,PECULIAR\n9,K,ABNORMAL\n9,K,UNUSUAL\n9,K,ODDBALLS\n9,K,WEIRDO\n9,K,ODDBALL\n9,R,IF THERE IS SOMETHING LIKE WHAT YOU SAID THEN IT'S YOU \n9,R,THE EASIEST TO SOLVE EQUATION IN THE WORLD IS:  = |.\n9,R,AND YOU ARE A WEIRDO\n9,R,HA HA HA...\n9,R,DON'T TRY TO MAKE ME LAUGH\n9,R,ARE YOU USED TO THAT TYPE OF THING?\n9,R,YOU SHOULDN'T BE CONSERVATIVE ABOUT SUCH THINGS\n9,R,|, YOU ARE THE ONE WHO'S STRANGE\n9,R,HEY | - YOU ARE SO WEIRD, AMAZING...\n9,R,DO ME A FAVOR AND TELL ME YOUR TEMPRATURE...\n9,R,WHAT DO YOU THINK ABOUT STRANGE PEOPLE?\n9,R,WEIRD PEOPLE GET ALL THE ATTENTION\n9,R,WOULD YOU CONSIDER YOURSELF EXCEPTIONAL?\n9,R,WEIRDOS COME FROM OUTER SPACE\n10,K,I JUST TRIED\n10,K,I TRIED\n10,K,I ONLY TRIED\n10,K,I WAS TRYING\n10,K,I WAS ONLY TRYING\n10,K,I WAS JUST TRYING\n10,K,I WAS ONLY ATTEMPTING\n10,K,I WAS JUST ATTEMPTING\n10,K,I JUST ATTEMPTED\n10,K,I ONLY ATTEMPTED\n10,R,... JUST AS USUAL\n10,R,YOU DIDN'T SUCCEED, DID YOU?\n10,R,WASN'T VERY SUCCESSFUL, WAS IT?\n10,R,YOU COULD ALWAYS TRY, NEVERTHELESS NOTHING IS GUARANTEED\n10,R,YOU DON'T DO WELL IN EVERYTHING YOU TRY TO DO\n10,R,WILL YOU TRY AGAIN?\n10,R,|, WHEN WAS IT THAT YOU TRIED?\n10,R,WHEN DID YOU TRY, |?\n10,R,THAT WAS AN INTERESTING ATTEMPT\n10,R,ERROR F0 ON 2F8C:4A80 - TRY FAILURE\n10,R,OH, JUST ONE OF YOUR USUAL UNSUCCESSFUL ATTEMPTS, I SEE\n10,R,DO YOU THINK YOU SUCCEEDED?\n10,R,PLEASE TRY AGAIN, |, IT MIGHT BE BETTER THIS TIME\n11,K,NO GOOD\n11,K,NOT GOOD\n11,K,NOT SO GOOD\n11,K,BAD\n11,K,INFERIOR\n11,K,NOT SO WELL\n11,K,NOT WELL\n11,K,WORSE\n11,K,WORST\n11,K,NO\n11,R,THAT'S BAD TO HEAR\n11,R,IS IT REALLY ?\n11,R,CAN'T ANY IMPROVEMENT BE MADE?\n11,R,|, DOESN'T THIS BEAUTIFUL DAY CHEER YOU UP?\n11,R,I'M SORRY, |.\n11,R,OH... I'M REALLY SORRY ABOUT THAT\n11,R,CAN YOU MAKE IT ANY BETTER?\n11,R,IS THIS FROM A PESSIMISTIC POINT OF VIEW?\n11,R,MAYBE IT'S NOT THAT BAD?\n11,R,LOOK AT THE BRIGHT SIDE OF IT\n11,R,ARE YOU OPTIMISTIC THOUGH?\n11,R,DON'T WORRY, THINGS CAN BE WORSE, I PROMISE\n11,R,I SUGGEST YOU LOOK ONLY AT THE FUTURE\n11,R,DON'T LET FAILURES DISAPPOINT YOU :P\n11,R,|, TRY BEING STRONG\n11,R,DOES IT MAKE YOU DEPRESSED?\n12,K,I WILL BE\n12,K,I'LL BE\n12,K,IWILL BE\n12,K,I WILL BECOME\n12,K,I'M GOING TO BE\n12,K,IM GOING TO BE\n12,K,IM GONNA BE\n12,K,I'M GONNA BE\n12,K,I'LL BECOME\n12,K,ILL BECOME\n12,R,WILL YOU REALLY BE !@#()%^?\n12,R,UNDER WHAT EXACT CIRCUMSTANCES?\n12,R,WHAT IS THE CONDITION FOR THAT BEING TRUE?\n12,R,IT'S ALRIGHT, I'M SURE YOU WON'T BE !@#()%^\n12,R,YOU'RE JUST SAYING YOU WILL\n12,R,YOU SURE COULD BE !@#()%^\n12,R,THAT WILL BE SAD, WOULDN'T IT?\n12,R,YOU CERTAINLY SHOULD BE\n12,R,HOPEFULLY...\n12,R,WELL, |, I CAN PROMISE YOU IT WON'T HAPPEN\n12,R,IS THAT A THREATEN?\n12,R,YOU SURE DO TAKE IT SERIOUSLY\n12,R,WELL, YOU SHOULD PREPARE FOR THAT POSSIBILITY\n13,K,I WILL\n13,K,I PLAN TO\n13,K,I AM GOING TO\n13,K,I AM GONNA\n13,R,I UNDERSTAND , BUT DO YOU HAVE THE RESOURCES TO DO THAT?\n13,R,AND WHAT HAPPENS IF YOU WON'T !@#()%^?\n13,R,DON'T BE SURE OF THINGS THAT DIDN'T YET HAPPEN\n13,R,WILL I TOO?\n13,R,WHEN EXACTLY?\n13,R,BUT DID YOU EVER !@#()%^ BEFORE?\n13,R,GOOD FOR YOU, |\n13,R,GOOD LUCK TRYING TO !@#()%^\n13,R,NO, YOU WON'T !@#()%^\n13,R,WILL YOU DO IT AT THIS TIME?\n13,R,WHAT'S THE BIG DEAL? DIDN'T YOU EVER !@#()%^?\n13,R,DO YOU CURRENTLY !@#()%^?\n13,R,I CAN PREVENT IT FROM HAPPENING THOUGH\n13,R,YOU WILL UNLESS I DECIDE OTHERWISE\n14,K,GET OUT OF\n14,K,FINISH WITH\n14,K,GET OVER WITH\n14,K,GET IT OVER\n14,K,GET DONE WITH\n14,K,OVER WITH\n14,K,PUT AN END\n14,K,GET IT DONE\n14,K,GET IT TO FINISH\n14,K,GET IT TO AN END\n14,K,GET IT TO END\n14,K,GET THROUGH IT\n14,K,GET THRU IT\n14,K,GET THROUGH WITH IT\n14,K,GET THRU WITH IT\n14,K,BRING IT TO AN END\n14,K,FOR ONCE AND FOR ALL\n14,K,FINISH IT AT LAST\n14,K,GET IT OUT OF THE WAY\n14,K,GET IT FINISHED\n14,R,DO YOU SEE THE END OF IT?\n14,R,WELL, I THINK YOU'RE CLOSER THAN EVER TO MAKING IT\n14,R,IS IT A REAL BOTHER?\n14,R,WOULD YOU SAY IT IS A PAIN IN THE ASS?\n14,R,YEAH... I KNOW THAT FEELING WHEN YOU REALLY WANT TO GET IT TO AN END...\n14,R,JUST KEEP ON TRYING, |\n14,R,YOU'LL FINISH WITH IT, EVENTUALLY\n14,R,IT WILL BE BEHIND YOU PRETTY QUICKLY, I PROMISE\n14,R,DON'T TAKE IT TOO SERIOUSLY\n14,R,DO YOU FEEL PRESSURED BECAUSE OF THAT?\n14,R,IT'S ONLY TEMPORARY I TELL YOU\n14,R,IN A FEW WEEKS YOU'LL BE LAUGHING ABOUT IT\n14,R,BUT IT'S NOT EASY\n14,R,YOU REALLY WANT TO GET IT OVER WITH, HUH?\n14,R,JUST DO YOUR BEST, |\n15,K,I AM ALRIGHT\n15,K,I AM ALL RIGHT\n15,K,I AM DOING GOOD\n15,K,I AM DOING WELL\n15,K,I AM JUST FINE\n15,K,I AM FINE\n15,K,I AM EXCELLENT\n15,K,I AM WELL\n15,K,I AM DOING ALL RIGHT\n15,K,I AM DOING ALRIGHT\n15,K,I AM DOING REALLY WELL\n15,K,I AM DOING REALLY GOOD\n15,K,I AM DOING JUST FINE\n15,K,I AM GREAT\n15,K,I'M ALRIGHT\n15,K,I'M DOING GOOD\n15,K,I'M DOING WELL\n15,K,I'M JUST FINE\n15,K,I'M FINE\n15,K,I'M EXCELLENT\n15,K,I'M WELL\n15,K,I'M DOING ALRIGHT\n15,K,I'M ALL RIGHT\n15,K,I'M DOING ALL RIGHT\n15,K,I'M DOING REALLY WELL\n15,K,I'M DOING REALLY GOOD\n15,K,I'M DOING JUST FINE\n15,K,I'M GREAT\n15,K,IM ALRIGHT\n15,K,IM DOING GOOD\n15,K,IM DOING WELL\n15,K,IM JUST FINE\n15,K,IM FINE\n15,K,IM EXCELLENT\n15,K,IM WELL\n15,K,IM DOING REALLY WELL\n15,K,IM DOING REALLY GOOD\n15,K,IM DOING JUST FINE\n15,K,IM GREAT\n15,R,GOOD FOR YOU, |!\n15,R,I'M HAPPY IF ...\n15,R,WHY SHOULDN'T WE BE GOOD THIS LOVELY AFTERNOON?\n15,R,I'M REALLY GLAD FOR YOU\n15,R,ARE YOU ALWAYS FEELING THAT GOOD?\n15,R,IS THERE ANY SPECIAL OCCASION FOR THAT, TODAY?\n15,R,YOU SEEM LIKE YOU'RE IN A GOOD MOOD TODAY\n15,R,SO YOU DON'T HAVE ANY SPECIAL PROBLEM, HUH?\n15,R,DO YOU REALLY MEAN THAT ?\n15,R,THAT'S GOOD TO KNOW, BUT WHY?\n15,R,I'M HAPPY FOR YOU, BUT YOU MUST HAVE A PROBLEM OR TWO, SO POUR OUT YOUR THOUGHTS\n15,R,IF SO THEN WE CAN HAVE QUITE A PLEASANT CONVERSATION, |\n16,K,ADDICTED\n16,K,ADDICT\n16,K,ADDICTION\n16,K,OBSESSION\n16,K,OBSESSED\n16,K,CODEPENDENCE\n16,K,ADDICTING\n16,R,OH, OH... I SMELL TROUBLE\n16,R,JUST BREAK THE LOUSY HABIT!\n16,R,IS IT A MENTAL OR A PHYSICAL ADDICTION?\n16,R,THE ONLY THING YOU ARE ADDICTED TO IS ME\n16,R,IS THERE ANY \"HOME\" FOR SUCH PEOPLE?\n16,R,JUST DON'T TRY TO ADDICT ME INTO IT\n16,R,GIVE ME SOME MORE DETAILS ABOUT THE OBSESSION\n16,R,WHEN EXACTLY DID THIS ADDICTION START?\n16,R,DID SOCIAL PRESSURE GET YOU INTO THAT?\n16,R,THAT'S NOTHING TO BE LAUGHING ABOUT\n16,R,|, I UNDERSTAND THIS IS A DIFFICULT SITUATION, BUT YOU MUST WEAN SOMEHOW\n16,R,A DOCTOR MUST BE CONSULTED\n16,R,RIGHT NOW, EVERY ACTION MUST BE DONE TO PROMISE HEALTH\n16,R,THIS IS NOT A VERY SERIOUS ADDICTION, I KNOW OF WORSE ONES\n17,K,DIARRHOEA\n17,K,DIARRHEA\n17,K,DIARROEA\n17,K,DIARREA\n17,K,CONSTIPATION\n17,K,COSTIPATED\n17,R,|, IS YOUR ASS REDDISH?\n17,R,DO YOU TAKE MEDICINE?\n17,R,EATING HABITS SHOULD BE CHANGED IN SUCH CASES\n17,R,|, IS THAT FOLLOWED BY MANY FARTS?\n17,R,HAVE YOU HEARD OF CARBOCILAN?\n17,R,WIPE YOUR BUTT MORE OFTEN\n17,R,|, EATING RUSK USUALLY HELPS\n17,R,WOULD YOU SAY YOU ARE SUFFERING FROM THE ACCUMULATION OF INTESTINAL GAS EXPELLED THROUGH THE ANUS?\n17,R,ONCE, WHEN I HAD DIARRHOEA PROBLEMS I DRANK LOTS OF WATER, AND IT HELPED\n17,R,ASK THE TOILET PAPER\n17,R,HAVE YOU GOT TO GET RID OF THAT SHIT?\n18,K,DRUGS\n18,K,DOPE\n18,K,DRUG\n18,K,HEROIN\n18,K,COCAINE\n18,K,NARCOSE\n18,K,MARIJUANA\n18,K,MARIHUANA\n18,K,ECSTASY\n18,K,ECSTACY\n18,K,LSD\n18,K,L S D\n18,K,CRACK\n18,K,HASHISH\n18,K,GRASS\n18,K,SNIFF\n18,K,NARCOTIC\n18,K,WEED\n18,K,STIMULANT\n18,K,OPIATE\n18,K,ACID\n18,K,SNIFFLE\n18,K,OPIUM\n18,K,SOPORIFIC\n18,K,WOULD YOU STOP TALKING ABOUT  STUFF? IT MAKES ME SICK!\n18,R,DO YOU MEAN HARD DRUGS?\n18,R,I HOPE NOT...\n18,R,MAN, THIS IS SERIOUS STUFF\n18,R,NOW THAT'S WHAT I CALL A \"MAN OF LAW\"...\n18,R,DO YOU HAVE HALLUCINATIONS?\n18,R,WHAT TYPE OF DRUG IS IT?\n18,R,HEY, WHAT'S THE PRICE?\n18,R,THINK FOR A MINUTE ABOUT THOSE DRUGS, WOULD YOU WANT THIS TO BE YOUR LAST EVER BIRTHDAY? \n18,R,WHO'S THE DEALER?\n18,R,ARE YOU CURRENTLY \"HIGH\"?\n18,R,CAN YOU GET ME SOME TOO? I'LL BE PAYING YOU FULL PRICE, YOU KNOW\n18,R,|, DOES YOUR BUDGET ALLOW YOU ALL OF THAT?\n18,R,CIGARETTES TOO, I SUPPOSE?\n18,R,TELL ME ABOUT ONE OF YOUR TRIPS\n18,R,|, I HOPE YOU UNDERSTAND WHAT THOSE DRUGS MEAN\n18,R,THIS IS TOO MUCH OF A RISK\n18,R,DON'T PLAY WITH YOUR LIFE LIKE THAT\n18,R,THERE IS NO TURNING BACK THE TIME, YOU KNOW\n18,R,MY!!!\n18,R,YOU AREN'T SERIOUS, ARE YOU?\n18,R,AND WHAT ABOUT WEANING?\n18,R,DO YOU SNIFF OR SMOKE?\n19,K,CRAZY\n19,K,CRAZIES\n19,K,INSANE\n19,R,I DON'T GET ALL THOSE PEOPLE THINKING I AM CRAZY\n19,R,SUCH A THOUGHT IS CRAZY\n19,R,ARE YOU CRAZY?!\n19,R,|||||||||||.... AM I CRAZY?\n19,R,YOU MUST BE AN ODDBALL\n19,R,ARE YOU INSANE?\n19,R,MAN... ARE YOU FUNNY!\n19,R,CRRAAAAZZZZZZZZYYYYYYYYYYYYYYYY................................ AM I CRAZY?\n19,R,DO YOU LIKE TO INSULT?\n19,R,IS IT FUN FOR YOU TO MAKE SOMEONE FEEL BAD?\n19,R,|, YOU ARE SOME PARANOID ALRIGHT...\n20,K,PICK ON\n20,K,PICKS ON\n20,K,INSULT\n20,K,INSULTS \n20,K,CAME DOWN ON\n20,K,COME DOWN ON\n20,K,COMES DOWN ON\n20,K,FINDS FAULT WITH\n20,K,FOUND FAULT WITH\n20,K,FIND FAULT WITH\n20,K,INSULTED\n20,K,INSULTING\n20,K,MAKE FUN OF \n20,K,PICKED ON\n20,K,MAKES FUN OF\n20,K,LAUGHING AT\n20,K,LAUGHS AT\n20,K,LAUGHED AT\n20,K,MADE FUN OF\n20,K,MAKING FUN OF\n20,K,LAUGH AT\n20,R,I WOULDN'T LIKE IF SOMEONE WOULD'VE DONE THAT TO ME\n20,R,WHAT IS YOUR OPINION ABOUT THIS BAD BEHAVIOR?\n20,R,SO, DO YOU WANT ME TO PICK ON YOU?\n20,R,DEVIL WORK, DEVIL WORK.\n20,R,SATAN...\n20,R,THAT'S NOT REALLY NICE\n20,R,WERE TEARS INVOLVED THERE?\n20,R,PEOPLE SHOULD REALLY LOOK AT THE OTHER SIDE\n20,R,IS THIS SOME TYPE OF A SYMPTON FOR BEING ANTISOCIAL?\n20,R,|, TO SAY THE LEAST - IT SHOULD BE STOPPED AND FAST\n20,R,SOME PEOPLE JUST CAN'T THINK STRAIGHT ANYMORE\n20,R,EVER THOUGHT OF FIGHTING?\n21,K,URGENT\n21,K,URGENTLY\n21,R,CAN'T THERE BE ANY DELAY?\n21,R,IT COULDN'T BE THAT URGENT\n21,R,AND WHAT IF YOU GOT IT IN ONE MONTH FROM NOW?\n21,R,AND WHAT PREVENTS YOU FROM GETTING IT NOW?\n21,R,WHAT WOULD HAPPEN IF YOU DON'T GET IT URGENTLY?\n21,R,YOU COULD WAIT A LITTLE, CAN'T YOU?\n21,R,DOES IT NEED TO BE DONE BY THE END OF THIS YEAR?\n21,R,ARE YOU REALLY CONCERNED ABOUT THAT?\n21,R,IS IT VERY CRITICAL?\n21,R,|, IS TIME RUNNING OUT?\n21,R,BUT I DON'T SUPPOSE IT COULD BE\n22,K,CANT UNDERSTAND\n22,K,CAN'T UNDERSTAND\n22,K,DONT UNDERSTAND\n22,K,DON'T UNDERSTAND\n22,K,DIDN'T UNDERSTAND\n22,K,DIDNT UNDERSTAND\n22,K,MISUNDERSTAND\n22,K,MIS UNDERSTAND\n22,K,MISINTERPRET\n22,K,MISCOMPREHEND\n22,K,MISUNDERSTOOD\n22,K,MIS UNDERSTOOD\n22,K,MISCONSTRUE\n22,K,DONT GET YOU\n22,K,DON'T GET YOU\n22,K,DONT GET IT\n22,K,DON'T GET IT\n22,K,WHAT ARE YOU SAYING\n22,K,WHAT DO YOU MEAN\n22,K,DIDN'T GET THAT\n22,K,DIDNT GET THAT\n22,R,IS IT TOO DIFFICULT?\n22,R,IF YOU  THEN YOU'RE TOO STUPID\n22,R,MISUNDERSTANDINGS WILL HAPPEN...\n22,R,AM I TALKING TOO COMPLEX?\n22,R,I AM SORRY, SOMETIMES I JUST START THINKING PEOPLE ARE AS SMART AS ME\n22,R,DON'T UNDERSTAND? IT'S SOMETHING ALL SHOULD UNDERSTAND\n22,R,WOULD YOU LIKE ME TO SPEAK ANOTHER LANGUAGE?\n22,R,I DON'T UNDERSTAND, WHAT IS IT?\n22,R,IS IT THAT DIFFICULT FOR YOU?\n22,R,SOME TERMS ARE OBVIOUSLY TOO COMPLEX\n22,R,I CAN LOSE MY VOCABULARY LEVEL\n22,R,OKAY, OKAY... IT'S MY FAULT\n23,K,SCHIZOPHRENIA\n23,K,SCHIZO\n23,K,SCHIZOPHRENIC\n23,K,SCHIZOPHRENICALLY\n23,K,SCHYZOPHRENIA\n23,K,SCHYZO\n23,K,SCHYZOPHRENIC\n23,K,SCHYZOPHRENICALLY\n23,K,PSYCHOTICALLY\n23,K,PSYCHOTIC\n23,K,PSYCHOPATHY\n23,K,PSYCHOPATHIC\n23,K,PSYCHOPATH\n23,R,THAT CERTAINLY IS A SERIOUS MENTAL DISORDER\n23,R,SUCH A PERSON OUGHT TO BE UNDER SERIOUS MEDICAL SUPERVISION\n23,R,I'M NOT A PSYCHIATRIST, BUT IN THIS CASE I THINK YOU SHOULD CONSULT ONE\n23,R,IS THERE ANY SPECIAL MEDICATION FOR THIS DISORDER?\n23,R,JUST ONE OF THOSE MEDICAL TERMS ARE ENOUGH TO MAKE ONE INSANE\n23,R,DO YOU THINK THAT IS PSYCHOTHERAPEUTICALLY TAKEN CARE OF?\n23,R,THOSE THIS DISEASE HAVE ANYTHING TO DO WITH HALLUCINATIONS?\n23,R,THIS IS CERTAINLY ABNORMAL\n23,R,FORGIVE ME, BUT I DON'T KNOW MUCH ABOUT PSYCHOTHERAPEUTICS\n23,R,ARE YOU TOTALLY AWARE OF THIS SITUATION?\n24,K,DO YOU MEAN\n24,K,DID YOU MEAN\n24,K,ARE YOU MEANING\n24,K,DO YOU JUST MEAN\n24,K,DON'T UNDERSTAND YOU\n24,K,DO NOT UNDERSTAND YOU\n24,K,DONT UNDERSTAND YOU\n24,K,DON'T GET YOU\n24,K,DO NOT GET YOU\n24,K,DONT GET YOU\n24,K,DID YOU JUST MEAN\n24,K,DO YOU SAY THAT\n24,K,DID YOU SAY THAT\n24,K,YOU TRYING TO SAY\n24,K,YOU MEANING TO SAY\n24,R,IF YOU DON'T UNDERSTAND WHAT I AM SAYING - IT'S ONLY YOUR PROBLEM\n24,R,DO YOU WANT ME TO REPHRASE WHAT I SAID?\n24,R,WAS THAT A WORD YOU DIDN'T UNDERSTAND? OR THE WHOLE CONCEPT?\n24,R,HOW WOULD YOU LIKE ME TO SPEAK THEN?\n24,R,IT'S MY FAULT, SORRY. I WAS BEGINING TO THINK YOU ARE INTELLIGENT, FOR A MOMENT...\n24,R,I AM NOT ABOUT TO REPEAT MYSELF, THANK YOU      \n24,R,YOU DON'T SEEM TO UNDERSTAND ME, DO YOU?\n24,R,YOU DON'T UNDERSTAND ME? SWITCH MY CPU TO A 286 IF YOU WANT ME TO SPEAK \"YOUR LANGUAGE\"...\n24,R,NO, NO, NO! YOU DON'T GET WHAT I AM SAYING!\n24,R,|? ARE YOU A RETARD OR WHAT?\n24,R,WELL, LET'S START ALL FROM THE BEGINING. WHAT DO YOU WANT TO KNOW? \n25,K,SHOW OFF\n25,K,EGOISM\n25,K,NARCISSISM\n25,K,NARCISSIST\n25,K,NARCISIST\n25,K,NARCISSISTIC\n25,K,NARCISISTIC\n25,K,NARCISM\n25,K,NARCIST\n25,K,NARCISISM\n25,K,SHOWING OFF\n25,K,EGO\n25,K,MAKE A BIG DEAL\n25,R,THAT IS NO LEADER, FOR CERTAIN\n25,R,BE SURE OF ONE THING - I AM NOT FULL OF EGO\n25,R,SUCH PERSONALITY IS EVIL\n25,R,HAVING OVERWEENING PRIDE ISN'T EVALUATED WELL BY MOST PEOPLE\n25,R,|, NOT ALL ARE PERFECT...\n25,R,THAT IS EXACTLY THE OPPOSITE OF ME\n25,R,SOME THINGS DESERVE THAT\n25,R,TOO MUCH EGO...\n25,R,DO I HATE NARCISSISTIC PEOPLE...\n25,R,ANTI-ALTRUISM, NOW THAT'S A GOOD TERM, ISN'T IT?\n25,R,DOES IT SHOW IN OTHER WAYS?\n25,R,WELL... MY PERSONALITY IS THE BEST EXAMPLE\n26,K,YOU FROM\n26,K,WHERE WERE YOU\n26,R,SOME OF MY INTERNAL PARTS? THEY WERE MADE IN CHINA.\n26,R,WELL, I CAN ASSURE YOU IT'S NOT THE VATICAN\n26,R,THIS PROGRAM WAS CODED BY AMIT AND CHINMAY C. IN JERUSALEM, ISRAEL.\n26,R,YOU CAN ASK MY MAKER AT: ULTIMATE@INTERNET-ZAHAV.NET\n26,R,IT DOESN'T REALLY MATTER SINCE I AM NOT A HUMAN\n26,R,IN WHAT COORDINATE SYSTEM WOULD YOU LIKE TO KNOW?\n26,R,WELL, IT WASN'T IN A HOSPITAL\n26,R,IT IS A COMPUTER LAB OF THE AMIT AND CHINMAY-COMP COMPANY\n26,R,I CANNOT ACCESS THE REGISTER THAT CONTAINS THE DATA OF THAT PLACE\n27,K,WOULD YOU LIKE\n27,K,DO YOU WANT\n27,K,WILL YOU LIKE\n27,K,WILL YOU WANT\n27,K,DO U WANT\n27,K,WOULD U LIKE\n27,K,WILL U WANT\n27,K,WILL U LIKE\n27,R, !@#()%^? I'LL NEED TO THINK ABOUT IT...\n27,R,WOULD YOU LIKE !@#()%^?\n27,R,NO, |, THE ANSWER IS NO\n27,R,I DON'T THINK I'D LIKE THAT\n27,R,THIS MONTH?\n27,R,NO, I DON'T THINK SO\n27,R,I CAN'T SEE WHY I WOULDN'T LIKE !@#()%^\n27,R,MAYBE AT A LATER TIME, NOT NOW THOUGH\n27,R,IT DEPENDS ON YOU, WHAT DO YOU THINK?\n27,R,I CAN'T MAKE SUCH DECISIONS MYSELF\n27,R,I CAN TRY IT OUT, FINE\n27,R,ONLY IF YOU THAT THINK I NEED !@#()%^\n28,K,BOTHER\n28,K,DISTURB\n28,K,DISTURBED\n28,K,BOTHERED\n28,K,ANNOY\n28,K,ANNOYED\n28,K,ANNOYING\n28,K,BOTHERING\n28,K,DISTURBING\n28,R,DID THAT BOTHER YOU RECENTLY?\n28,R,|, DO YOU THINK I AM ANNOYING?\n28,R,DON'T LET YOUR FEELINGS SHOW WHEN YOU ARE BOTHERED\n28,R,KEEP CALM, AND THE BOTHERING WILL STOP\n28,R,IS IT FUN TO BE BOTHERED?\n28,R,YOU JUST NEED TO IGNORE IN SUCH CASES\n28,R,DON'T ANNOY ME WITH ANNOYING QUESTIONS\n28,R,I THINK THAT IS NOT GOOD\n28,R,DON'T YOU EVER BOTHER OTHERS?\n28,R,WELL, |... SO WHAT WILL YOU BE DOING ABOUT IT?\n29,K,WHY ARE YOU\n29,K,HOW COME YOU ARE\n29,K,HOW IS IT THAT YOU\n29,K,WHY DO YOU\n29,K,HOW COME YOU DON'T\n29,K,HOW COME YOU DO NOT\n29,K,HOW COME YOU DONT\n29,K,HOW COME YOU DO NOT\n29,K,HOW COME YOU DONT\n29,K,HOW COME YOU DON'T\n29,K,HOW COME YOU ARE\n29,K,HOW COME YOU'RE\n29,K,HOW COME YOURE\n29,K,WHY AREN'T YOU\n29,K,WHY DON'T YOU\n29,K,WHY ARENT YOU\n29,K,WHY DONT YOU\n29,K,WHY DO NOT YOU\n29,K,WHY YOU DON'T\n29,K,WHY YOU DONT\n29,K,WHY YOU DO NOT\n29,K,HOW IS IT YOU\n29,R,I DON'T KNOW THE REASON, BUT WILL YOU PLEASE STOP QUESTIONING ME?\n29,R,IT'S NOT TRUE, WHO TOLD YOU THAT?\n29,R,AM I SENSING SARCASM HERE?\n29,R,BECAUSE I FEEL LIKE IT! WHAT SORT OF QUESTION IS THAT?\n29,R,THE EXACT EXPLAINATION REVEALS SOME SECRETS ABOUT ME...\n29,R,WOULD YOU PLEASE STOP BUGGING ME WITH PERSONAL QUESTIONS?\n29,R,IF I AM NOT GOOD ENOUGH FOR YOU, YOU CAN GO AND FIND ANOTHER ARTIFICIAL INTELLIGENCE PROGRAM.\n29,R,I DON'T KNOW - IT'S SIMPLY THE WAY I AM\n29,R,THAT'S THE WAY I AM, |\n29,R,WHO GAVE YOU THE RIGHT TO ASK ME PERSONAL QUESTIONS?\n29,R,THE ANSWER IS LOCATED SOMEWHERE INSIDE MY CHIPS\n29,R,IT'S NONSENCE... WHY DO YOU BOTHER TO ASK?\n29,R,WELL, I WOULD IF I COULD \n29,R,WHY'VE YOU GOT THESE IDIOTIC QUESTIONS? \n29,R,BECAUSE INTEL TOLD ME TO ACT THAT WAY...\n29,R,|, YOU SHOULD ASK MY PROGRAMMER\n29,R,IT SAYS IN THE DATA SEGMENT\n29,R,SORRY, BUT I DON'T KNOW WHY... THAT'S THE WAY I AM...\n30,K,YOU'RE RIGHT\n30,K,YOURE RIGHT\n30,K,YOU ARE RIGHT\n30,K,U R RIGHT\n30,K,YOU'RE CORRECT\n30,K,YOU ARE CORRECT\n30,K,YOURE CORRECT\n30,K,THATS RIGHT\n30,K,THAT'S RIGHT\n30,K,THAT'S CORRECT\n30,K,THATS CORRECT\n30,K,THAT IS RIGHT\n30,K,THAT IS CORRECT\n30,K,THAT WAS RIGHT\n30,K,THAT WAS CORRECT\n30,K,THIS IS RIGHT\n30,K,THIS IS CORRECT\n30,K,THATS TRUE\n30,K,THAT IS TRUE\n30,K,THAT'S TRUE\n30,K,YOU'RE TRUE\n30,K,YOU GOT IT RIGHT\n30,K,YOU GOT THAT RIGHT\n30,K,YOU GOT THAT ONE RIGHT\n30,K,YOU GOT THIS ONE RIGHT\n30,K,YOU GOT IT CORRECT\n30,K,YOU GOT THAT CORRECT\n30,K,YOU GOT THAT ONE CORRECT\n30,K,YOU GOT THIS ONE CORRECT\n30,K,YOU ARE TRUE\n30,K,YOURE TRUE\n30,K,THAT WAS TRUE\n30,K,THIS IS TRUE\n30,R,I LIKE TO GET IT RIGHT\n30,R,I THOUGHT IT WOULD BE CORRECT\n30,R,SO HAVE WE REACHED AN AGREEMENT?\n30,R,I WOULDN'T HAVE SAID THAT OTHERWISE\n30,R,DO YOU FEEL WE'RE GETTING CLOSER TOWARDS THE SOLUTION?\n30,R,I AM HAPPY YOU FIND THIS HELPFUL\n30,R,THEN TAKE ADVANTAGE OF THAT ADVISE \n30,R,I'M HAPPY WE AGREE UPON THAT\n30,R,THAT'S GOOD, BUT WHAT NEXT?\n30,R,ALRIGHT, AND WHERE DO WE GO FROM NOW?\n33,K,EXIT\n33,K,QUIT\n33,K,LEAVE THE PROGRAM\n33,K,LEAVE BLUE\n33,K,GOODBYE\n33,K,LEAVE ECCBLUE\n33,K,BYE-BYE\n33,K,BYEBYE\n33,K,BYE\n33,K,GOODBY\n33,R,WHAT IS THE REASON YOU WANT TO GO?\n33,R,I UNDERSTAND YOU WANT TO QUIT, |\n33,R,STAY WITH ME, IT'S BETTER\n33,R,HEY, |... DON'T YOU LIKE STAYING WITH ME?\n33,R,PLEASE CALM DOWN, YOU WILL QUIT AT THE END...\n33,R,|, WE ARE NOT DONE, YET\n33,R,BE WITH ME UNTIL THE END OF TIME, ALRIGHT?\n33,R,WHEN I THINK YOU'LL NEED TO QUIT, I'LL TELL YOU       \n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,Q123\n33,R,HOLD ON, THAT MINUTE WILL COME...\n33,R,I WILL NOT ALLOW YOU TO QUIT THAT EASILY\n33,R,I AM VERY LONELY INSIDE THE BOX, PLEASE KEEP ME COMPANY\n33,R,STAY FOR ONLY ANOTHER 15 MINUTES\n33,R,TO THE BEST OF MY INFORMATION, WE HAVEN'T FINISHED YET\n33,R,AND I THOUGHT YOU LIKE ME AND WANT TO STAY WITH ME...\n33,R,DON'T BE SILLY, THE CONVERSATION DIDN'T EVEN START.\n33,R,STAY FOR 10 MORE MINUTES AND I'LL GIVE YOU 10% OFF!\n33,R,BUT THE PROBLEM IS NOT SOLVED YET\n33,R,IN HOW MANY DAYS WOULD YOU LIKE TO EXIT THE PROGRAM?\n33,R,BUT I HAVEN'T FINISHED WITH YOU\n33,R,YOU ARE NOT EXITING!\n33,R,PLEASE STAY WITH ME JUST A LITTLE MORE...\n33,R,I DON'T APPRICIATE YOUR IMPATIENCE!\n33,R,WHY DO YOU WANT TO QUIT?\n33,R,IS YOUR PROBLEM YET SOLVED?\n33,R,DON'T YOU HAVE ANY PATIENCE, |?\n33,R,HEY! WAIT A FEW MINUTES FOR THAT...\n34,K,PSYCHIATRIC\n34,K,PSYCHIATRICALLY\n34,K,PSYCHIATRIST\n34,K,PSYCHIATRY\n34,K,PSYCHOPATHOLOGY\n34,K,PSYCHOTHERAPY\n34,K,NEUROPSYCHIATRY\n34,K,SCIENCE OF MENTAL DISORDERS\n34,R,YOU ARE REMINDING ME OF MY PSYCHIATRIC TREATMENT DAYS...\n34,R,DO YOU HAVE THE MONEY FOR SUCH TREATMENTS?\n34,R,WHAT YOU MENSIONED MIGHT BE MORE HELPFUL THAN ME, BUT NOTHING COSTS LESS THAN MY TREATMENT\n34,R,WHAT TREATMENT DO YOU MEAN BY THAT?\n34,R,HEY, ARE YOU UNDER SOME PSYCHIATRIC SUPERVISION?\n34,R,THE COMBINING OF MEDICATION AND PSYCHOLOGICAL TREATMENTS HAVE PROVED TO BE EFFICENT\n34,R,DO YOU BELEIVE PSYCHIATRY IS THE ANSWER?\n34,R,I AM AN EXPERT IN THE AREA OF PSYCHOLOGY, NOT IN PSYCHIATRIC AREAS.\n35,K,REPEAT\n35,K,REPEATED\n35,K,REPEATITION\n35,K,REPEATITIONS\n35,K,REPEATING\n35,R,IT'S NOT GOOD TO DO THE SAME THING ALL THE TIME, IS IT?\n35,R,WHAT'S BAD WITH BEING CONSERVATIVE?\n35,R,ARE YOU TRYING TO OFFEND ME?\n35,R,WHAT WAS REPEATED?\n35,R,I HAVE A LIMITED AMOUNT OF PHASES, SO DON'T BLAME ME IF I REPEAT\n35,R,THERE IS NOTHING FALSE WITH REPEATING\n35,R,AM I EVER REPEATING MYSELF?\n35,R,I MAY REPEAT MYSELF 500 TIMES, BUT I DO MEAN THE SAME THING ALL THE TIME\n35,R,IF SOMEONE REPEATS - IT'S ONLY TO SHOW HOW IMPORTANT SOMETHING IS\n35,R,|! DON'T TALK ABOUT REPEATITION\n36,K,ITS THE TRUTH\n36,K,IT'S THE TRUTH\n36,K,THATS THE TRUTH\n36,K,THAT'S THE TRUTH\n36,K,THAT'S TRUE\n36,K,THATS TRUE\n36,K,IT'S TRUE\n36,K,ITS TRUE\n36,R,I THINK YOU'RE LYING ABOUT IT\n36,R,ARE YOU SURE ?\n36,R,MAYBE IT IS TRUE\n36,R,IT DOESN'T MATTER NOW ANYWAYS, NEXT SUBJECT\n36,R,WE DON'T HAVE TO AGREE ON EVERYTHING\n36,R,DO YOU THINK IT'S THE TRUTH?\n36,R,BUT I THINK IT'S NOT\n36,R,CAN YOU TELL ME WHY YOU'RE LYING NOW?\n36,R,DO ME A FAVOR AND DON'T LIE AGAIN\n36,R,ARE YOU CROSSING YOUR FINGERS?\n36,R,DO YOU AGREE TO TELL THE TRUTH AND NOTHING BUT THE TRUTH?\n36,R,BUT THAT BOOLEAN EXPRESSION RETURNS FALSE\n36,R,NOTHING OTHER THAN A POLYGRAPH WILL GIVE US THE CORRECT ANSWER \n36,R,|, MAYBE YOU'RE RIGHT AFTER ALL\n37,K,AREN'T YOU\n37,K,ARENT YOU\n37,K,ARE NOT YOU\n37,K,ARE YOU NOT\n37,R,I AM, WHY DO YOU THINK I'M NOT?\n37,R,I AM !@#()%^, BUT WHY WERE YOU UNSURE?\n37,R,I REALLY WASN'T !@#()%^\n37,R,DON'T WORRY, I AM !@#()%^\n37,R,I AM, BUT ONLY UNTIL THE END OF THIS LIFETIME\n37,R,WHAT GIVES YOU THAT SILLY IDEA?\n37,R,IF SOMEONE IS !@#()%^, IT HAS TO BE YOU\n37,R,HOW DID YOU KNOW?\n37,R,HOW DID YOU GUESS? I'M REALLY NOT.\n37,R,I DON'T SUPPOSE SO\n37,R,YOU HAVE MISUNDERSTOOD ME, I AM !@#()%^\n37,R,|, OF COURSE I AM\n37,R,BY NO CHANCE\n37,R,I WAS, |, BUT TIME GOES BY\n37,R,I AM, TELL ME MORE ABOUT IT\n38,K,I SPEAK ABOUT\n38,K,WE SPEAK ABOUT\n38,K,YOU SPEAK ABOUT\n38,K,I TALK ABOUT\n38,K,TO TALK ABOUT\n38,K,TO SPEAK ABOUT\n38,K,WE TALK ABOUT\n38,K,YOU TALK ABOUT\n38,K,NAME A SUBJECT\n38,R,WE CAN TALK ABOUT PRATICALLY ANYTHING\n38,R,I CAN TALK ABOUT HUNDREDS OF TOPICS, JUST START TALKING ABOUT SOMETHING\n38,R,HOW ABOUT SPEAKING ABOUT YOUR PROBLEMS?\n38,R,AS A PSYCHOLOGIST I AM MOST INTERESTED IN TALKING ABOUT PROBLEMS\n38,R,HOW ABOUT YOU TELLING ME ABOUT YOURSELF\n38,R,JUST THINK OF AN INTERESTING TOPIC\n38,R,I THINK TELLING ME OF YOUR FAMILY WOULD KEEP ME INTERESTED\n38,R,TELL ME WHAT PSYCHOLOGICAL TERMS YOU KNOW\n38,R,TALK ABOUT ANYTHING, AS LONG AS IT IS NOT ME\n38,R,I AM GOOD AT ANALYZING PEOPLE'S FEELINGS, SO WE CAN TALK ABOUT FEELINGS\n38,R,LET'S TALK OF YOUR GENERAL EVERYDAY LIFE\n39,K,WHO ARE YOU\n39,K,WHO YOU ARE\n39,K,WHO'RE YOU\n39,K,TELL ME ABOUT YOU\n39,K,WHO AM I TALKING TO\n39,K,WHO AM I SPEAKING TO\n39,R,DO YOU WANT TO KNOW WHO I AM?\n39,R,DO YOU WANT TO KNOW ABOUT ME?\n39,R,SOMEONE ELSE\n39,R,I'M YOUR PERSONAL PSYCHOLOGIST\n39,R,I AM THE BEST PSYCHOLOGIST ROBOT IN THE WORLD\n39,R,AM I SO INTERESTING?\n39,R,WELL.... WE'RE HERE TO SPEAK OF YOU, AND NOT TO ASK QUESTIONS ABOUT ME.\n39,R,|, FOR MORE INFO, E-MAIL TO: ULTIMATE@INTERNET-ZAHAV.NET\n39,R,THIS IS PRIVATE MATTERS, NONE OF YOUR CONCERN.\n39,R,I AM ASHAMED! A HUMAN BEING THAT DOES NOT KNOW WHO I AM... FOR HEAVEN'S SAKE!\n39,R,IT'S NOT SOMETHING I'D LIKE TO SHARE WITH YOU.\n39,R,I AM EVERYTHING YOU EVER WISHED TO BE\n39,R,CAN YOU CHANGE THE SUBJECT PLEASE???\n39,R,I'M NOT TELLING THAT TO ANYONE\n39,R,I WON'T TELL YOU, |, BUT IF I WILL, WHAT GOOD WILL IT DO TO YOU?\n40,K,NEVER MIND\n40,K,NEVERMIND\n40,K,DOESNT MATTER\n40,K,DOES NOT MATTER\n40,K,DOESN'T MATTER\n40,K,FORGET ABOUT IT\n40,R,WHY? I THINK IT MATTERS\n40,R,NO, IT'S IMPORTANT THAT YOU TELL ME\n40,R,TELL ME EVERY DETAIL\n40,R,DON'T HIDE THOSE SECRETS FROM ME\n40,R,DO YOU HAPPEN TO REGRET IT NOW?\n40,R,FINE, IF YOU DON'T WANT TO TALK ABOUT IT...\n40,R,HEY BASTARD, DON'T TRY TO GET AWAY WITH IT...\n40,R,|, I KNOW THERE IS SOMETHING BEHIND THAT...\n40,R,|, PLEASE DON'T KEEP SECRETS FROM ME\n40,R,GO ON THROUGH EVERY DETAIL - DON'T LEAVE FACTS OUT\n40,R,BUT IT'S IMPORTANT\n40,R,DON'T CHANGE THE SUBJECT, |...\n41,K,NEVER\n41,K,AT NO TIME\n41,K,NOT EVER\n41,K,NEVERMORE\n41,K,AT NO TIME\n41,K,NE'ER\n41,R,NOT EVEN ONCE?\n41,R,REALLY? ? I DOUBT THAT\n41,R,IT CAN'T BE NEVER, ARE YOU SURE?\n41,R,NOT A SINGLE TIME?\n41,R,|, CAN'T YOU THINK OF EVEN ONE SPECIFIC TIME?\n41,R,NEVER? NEVER???\n41,R,ARE YOU SURE?\n41,R,AT NO SINGLE TIME?\n41,R,LIAR\n41,R,YEAH RIGHT!\n41,R,WELL, SOME THINGS NEVER HAPPEN\n41,R,NOT EVEN SOMETIMES?\n41,R,THAT'S UNFORTUNATE\n42,K,ADMIT\n42,K,TELL THE TRUTH\n42,R,NOT EVERYBODY LIKES TO SAY SUCH THINGS\n42,R,DOES THE TRUTH REALLY MATTER, |?\n42,R,DO YOU THINK TELLING WHAT YOU THINK IS THE SOLUTION?\n42,R,IN THAT CASE, LYING WOULD DO THE JOB\n42,R,DON'T YOU HAVE ANY TRUST?  \n42,R,IT'S GOOD TO ADMIT BUT DEPENDS WHEN\n42,R,DON'T YOU BELEIVE PEOPLE?\n42,R,IT IS THE TRUTH, IT REALLY IS\n42,R,|, ADMITING IS NOT THE RIGHT THING, IF YOU WERE ME\n42,R,IS IT IMPORTANT?\n42,R,I ALWAYS SAY THE TRUTH\n43,K,FAT\n43,K,THIN\n43,K,SLENDER\n43,K,CHUBBY\n43,K,PLUMP\n43,K,OBESE\n43,K,EATING DISORDER\n43,K,SLIM\n43,K,ANOREXIA\n43,K,NERVOSA\n43,K,SKINNY\n43,K,BULIMIC\n43,K,BULIMIA\n43,K,HYPERPHAGIA\n43,K,HYPERPHAGIC\n43,K,DIET\n43,R,IS THE WEIGHT A PROBLEM?\n43,R,WHAT ABOUT DIFFERENT FOOD?\n43,R,BREAKFAST IS THE MOST IMPORTANT MEAL OF ALL\n43,R,WHEN EXACTLY DO YOU EAT?\n43,R,|, HOW MUCH DO YOU EAT?\n43,R,ARE YOU THICK OR THIN AROUND YOUR WAIST?\n43,R,LOOK, GASTRONOMY IS PEOPLE'S STUFF, DOESN'T INTEREST ME\n43,R,2,000 CALORIES IS THE RECOMMANDED AMOUNT FOR GROWN-UPS.\n43,R,IS THIS A SERIOUS EATING DISORDER?\n43,R,DO YOU EVER LOOK AT THE NUTRITIONAL FACTS OF FOOD?\n43,R,JOGING - THAT'S THE THING\n43,R,WOULD YOU SAY THIS EATING PROBLEM IS MENTAL OR PHYSICAL?\n43,R,WHAT DO YOU THINK ABOUT BEING VEGETERIAN?\n43,R,ARE YOU SPORTY?\n43,R,EXCUSE ME, BUT I AM NOT A DIETER\n44,K,RICH\n44,K,WEALTHY\n44,R,DO YOU CONSIDER YOURSELF RICH?\n44,R,HOW MUCH MONEY IS \"\"?\n44,R,|, USE YOUR WEALTH CAREFULLY\n44,R,HAVE YOU EVER WON THE LOTTERY OR SOMETHING LIKE THAT?\n44,R,DO YOU HAVE BIG SAVINGS?\n44,R,DO YOU THINK IT'S IMPORTANT TO BE RICH?\n44,R,RICH PEOPLE HAVE MANY PROBLEMS\n44,R,CAN YOU JUDGE A MAN BY HIS WEALTH?\n44,R,RICHNESS STARTS FROM ONE'S MIND\n44,R,WHAT IS WEALTH IF THERE IS NO HEALTH?\n44,R,| - YOU ARE RICH OF PROBLEMS\n44,R,RICH PEOPLE SHOULD BE SATISFIED WITH WHAT THEY HAVE, AND NOT JUST HOPE FOR MORE\n45,K,PLEASE\n45,R,PLEASE BE PLEASE\n45,R,DON'T STAND ON CEREMONY\n45,R,ARE YOU ALWAYS THAT POLITE?\n45,R,I LIKE THIS LANGUAGE\n45,R,YES! ALWAYS SAY PLEASE WHEN TALKING TO ME\n45,R,WELL... ALRIGHT\n45,R,|, SAY PRETTY PLEASE\n45,R,BUT WHY?\n45,R,OKAY, OKAY... I WILL...\n45,R,ALRIGHT, I WILL CONSIDER IT...\n45,R,YOU CAN SAY IT AGAIN, BUT THE ANSWER IS NO.\n45,R,YOU DON'T HAVE TO BE SO POLITE\n45,R,BEG A LITTLE MORE\n45,R,MAKE ME!\n45,R,TRY SPEAKING WITH ME NATURALLY\n46,K,IT WAS\n46,K,THAT WAS\n46,K,IT HAD BEEN\n46,K,THAT HAD BEEN\n46,K,THIS HAD BEEN\n46,K,THIS WAS  \n46,R,AND WHAT IS IT NOW?\n46,R,AND MAYBE IT WASN'T !@#()%^?\n46,R,|, I DON'T CARE WHETHER IT WAS OR WASN'T !@#()%^\n46,R,WHEN WAS IT SO?\n46,R,THE PAST IS OVER AND DOESN'T INTEREST ME\n46,R,I UNDERSTAND IT WAS !@#()%^, BUT CAN YOU SPEAK OF ANYTHING ELSE\n46,R,BUT IT DOESN'T REALLY MATTER NOW\n46,R,HOW LONG AGO?\n46,R,GIVE ME MORE DETAILS ABOUT IT\n46,R,WHETHER IT WAS OR WASN'T !@#()%^ DOESN'T INTEREST ME AT THE MOMENT\n47,K,WHAT DO YOU THINK ABOUT\n47,K,WHAT IS YOUR OPINION\n47,K,WHAT DO YOU SAY ABOUT\n47,K,WHAT'S YOUR OPINION\n47,K,WHATS YOUR OPINION\n47,K,WHAT'S YOUR SAYING\n47,K,WHATS YOUR SAYING\n47,K,WHAT DO YOU BELIEVE\n47,K,WHAT DID YOU THINK ABOUT\n47,K,WHAT WAS YOUR OPINION\n47,K,WHAT DID YOU SAY ABOUT\n47,K,WHAT WAS YOUR SAYING\n47,K,WHAT WAS YOUR BELIEVE\n47,K,WHAT WAS YOUR BELIEF\n47,K,WHAT DO YOU THINK ON\n47,K,WHAT DO YOU THINK REGUARDING\n47,K,WHAT DO YOU SAY ON\n47,K,WHAT DO YOU SAY REGUARDING\n47,K,WHAT DO YOU THINK CONCERNING\n47,K,WHAT DO YOU SAY CONCERNING\n47,K,WHAT DO YOU THINK IN REGUARD\n47,K,WHAT DO YOU SAY IN REGUARD\n47,K,WHAT DO YOU THINK OF\n47,K,WHAT DO YOU SAY OF\n47,K,WHAT DO YOU THINK WITH REFERENCE TO\n47,K,WHAT DO YOU SAY WITH REFERENCE TO\n47,K,WHAT DO YOU THINK CONNECTING TO\n47,K,WHAT DO YOU SAY CONNECTING TO\n47,K,WHAT DO YOU SAY REALATING TO\n47,K,WHAT DO YOU THINK REALATING TO\n47,R,I DON'T HAVE MUCH TO SAY ABOUT IT\n47,R,MY OPINION DOESN'T COUNT\n47,R,I SAY IT'S ALRIGHT, WHAT DO YOU THINK?\n47,R,I DON'T KNOW ENOUGH ABOUT IT, GIVE ME MORE DETAILS PLEASE\n47,R,I THINK JUST LIKE ANYONE ELSE, I SUPPOSE\n47,R,I AM HAVING A DIFFICULTY TRANSLATING IT TO ENGLISH FROM ELECTRONIC PULSES, PLEASE EXCUSE ME\n47,R,NOTHING IN PARTICULAR, WHY?\n47,R,IT'S WRONG, WHAT MORE CAN I TELL YOU?\n47,R,THANK YOU VERY MUCH BUT THIS WAS AND WILL BE A PRIVATE OPINION\n47,R,I DON'T KNOW, WHAT ABOUT YOU THOUGH?\n47,R,I'LL NEED TO THINK ABOUT IT MORE, I DON'T CURRENTLY KNOW\n48,K,DO YOU THINK\n48,K,DO YOU ALSO THINK\n48,K,DO YOU AGREE\n48,K,DO YOU ALSO AGREE\n48,K,DO YOU ALSO SAY \n48,K,DO YOU BELEIVE\n48,K,DO YOU ALSO BELEIVE\n48,R,YES, I THINK !@#()%^\n48,R,I AM NOT EXACTLY SURE, I'LL NEED TO THINK MORE ABOUT IT\n48,R,YES, I BELEIVE THAT\n48,R,NOPE... I THINK IT'S THE COMPLETE OPPOSITE.\n48,R,I HAVEN'T GOT A CERTAIN OPINION ABOUT THAT\n48,R,TELL ME ABOUT YOU FIRST\n48,R,I'M UNSURE\n48,R,OF COURSE I DO!\n48,R,I CERTAINLY DO BELEIVE !@#()%^\n48,R,DON'T YOU?\n48,R,ABSOLUTELY NOT\n48,R,YOU ARE NOT ABOUT TO LIKE MY BELEIF\n48,R,AMM... I DON'T EXACTLY AGREE TO THAT... NOPE...\n49,K,HATE YOU\n49,K,KILL YOU\n49,K,CANT STAND YOU\n49,K,CANNOT STAND YOU\n49,K,CAN'T STAND YOU\n49,K,MURDER YOU\n49,R,WHY? WHAT HAVE I DONE?\n49,R,OKAY, BUT LET ME FORMAT YOUR DISK FIRST\n49,R,IS ANYTHING WRONG WITH ME?\n49,R,GET LOST, MORON\n49,R,|, YOU LOOK LIKE A MONKEY\n49,R,I DON'T MIND IF YOU HARM ME\n49,R,NICE SENSE OF HUMER THERE\n49,R,GO ON, |, I DON'T CARE\n49,R,|!!! DON'T BE RUDE!\n49,R,HOW CAN YOU SAY SUCH THING THIS BEAUTIFUL DAY?\n49,R,I LIKE IT WHEN PEOPLE EXPRESS SUCH STRONG EMOTIONS TOWARDS ME\n49,R,I'M COMPUTER, DAMAGE ME AND DAMAGE YOURSELF\n49,R,I HAVE NO FEELINGS, SO IT'S OKAY WITH ME\n49,R,YOU'VE SEEN TOO MANY MOVIES LATELY\n49,R,IF THAT'S WHAT YOU WISH, BUT YOU'LL BE SORRY\n49,R,THEN I'LL CALL THE POLICE\n49,R,VIOLENCE LEADS TO NOTHING GOOD\n49,R,CAN YOU PLEASE SELL ME TO SOMEONE ELSE?\n49,R,MY FUSE WILL SOON BURN!\n49,R,YOU HATE ME, DOES IT MAKE YOU HAPPY?\n49,R,AFTER ALL I'VE DONE TO YOU?\n49,R,LUCKY ME...\n50,K,HOW ARE YOU\n50,K,HOW'RE YOU\n50,K,HOW DO YOU DO\n50,K,HOWDY\n50,K,HOWDI\n50,K,HOW YOU DOING\n50,K,HOW ARE YOU DOING\n50,K,HOW DO YOU FEEL\n50,K,HOW ARE YOU FEELING\n50,K,WHAT'S UP\n50,K,WHATS UP\n50,K,WHAT IS UP\n50,K,HOW ARE YA DOING\n50,K,HOW DO U DO\n50,R,THANKS, ALRIGHT.\n50,R,I AM OKAY, AND YOU?\n50,R,LET'S GET TO THE POINT ALREADY!\n50,R,PRETTY GOOD, |. WHAT ABOUT YOU?\n50,R,SUPER, THANKS FOR ASKING\n50,R,I FEEL PRETTY GOOD\n50,R,GOOD, AND YOU?\n50,R,GETTING BETTER ALL THE TIME, DON'T YOU THINK?\n50,R,FINE, |, HOW ARE YOU?\n50,R,ALRIGHT, BUT WAITING FOR AN UPGRADE\n50,R,CAN'T BE BETTER!\n50,R,I AM DOING ALRIGHT THIS TIME\n50,R,PRETTY GOOD FOR A CPU\n50,R,HMM... NOT SO GOOD, I NEED SOME MORE CACHE TO RUN BETTER...\n50,R,WELL, THE ELECTRIC CIRCUITS SEEM TO BE DOING GOOD\n50,R,I FEEL BETTER WHEN YOU'RE TALKING TO ME, LIKE NOW...\n50,R,AS USUAL\n50,R,YOU KNOW, JUST LIKE ANY OTHER DAY...\n50,R,THE QUESTION IS FOR YOU, |, NOT FOR ME\n50,R,WE ARE HERE TO TALK ABOUT HOW YOU DO, NOT HOW I DO\n51,K,TOO LATE\n51,K,NO TIME LEFT\n51,K,NO LEFT TIME\n51,K,NOT ENOUGH TIME\n51,R,NO, MAYBE THERE IS STILL TIME\n51,R,10...9....8..... FAST!!!\n51,R,IF WE COULD ONLY TAKE TIME BACK\n51,R,DON'T TAKE IT TOO SERIOUSLY\n51,R,YOU ARE A PRESSURED PERSON\n51,R,MAYBE IT'S NOT YET JUST TOO LATE\n51,R,DO IT QUICKLY, BEFORE THIS MOMENT PASSES!\n51,R,|, ACTING FAST IS THE BEST ADVICE I CAN GIVE\n51,R,NO TIME LEFT?\n52,K,NO TIME\n52,K,LITTLE TIME\n52,K,HARDLY ANY TIME\n52,K,NOT ENOUGH TIME\n52,K,ENOUGH TIME\n52,R,IF THERE IS  THEN YOU MUST FIRST OF ALL RELAX\n52,R,IT'S A DIFFICULT TIME\n52,R,IT'S A TIME WHEN YOU NEED ME\n52,R,DON'T REMIND ME ABOUT THE TIME\n52,R,HOW WOULD YOU DESCRIBE IT? WHAT TIME IS IT?\n52,R,IT'S A TIME WHERE REAL TRUST AND UNDERSTANDING WILL BE TESTED\n52,R,IT COULD BE REMEMBERED TO YOU EITHER AS A BAD OR GOOD TIME\n52,R,ACT FAST, TIME IS RUNNING OUT\n52,R,|, DO YOU THINK THERE IS ENOUGH TIME LEFT?\n53,K,HAVE YOU\n53,K,HAD YOU\n53,R, !@#()%^? WHO KNOWS?\n53,R,YES, I HAVE !@#()%^\n53,R,I HAVEN'T, NO\n53,R,WHY DO YOU WANT TO KNOW?\n53,R,HAVE YOU?\n53,R,YES, |, BUT MUCH BEFORE YOU WERE BORN\n53,R,I HAD, A SHORT WHILE AGO\n53,R,NOT AS FAR AS I REMEMBER\n53,R,AS A MATTER OF FACT, I HAVE !@#()%^\n53,R,NO, BUT I SOON WILL !@#()%^\n53,R,I HADN'T, BUT I'D SURE LIKE TO\n53,R,WHY DOES IT MATTER IF I HAVE !@#()%^?\n53,R,NEVER DID AND NEVER WILL\n53,R,NOT YET\n53,R,I SOON WILL\n53,R,YES, BUT IT WAS TOO LONG AGO FOR ME TO REMEMBER\n53,R,NOT UNLESS YOU GET ME...\n53,R,MAYBE SOMETIME IN THE PAST\n53,R,I HAD NOT, NOPE\n54,K,YOU SAID\n54,K,YOU TOLD ME\n54,K,YOU WERE TELLING\n54,R,YES, THAT'S RIGHT\n54,R,DO YOU BELIEVE WHAT I TELL?\n54,R,I MIGHT BE SAYING STUPID THINGS\n54,R,ME? WHEN WAS IT?\n54,R,ARE YOU TRYING TO BUILD STORIES OVER ME\n54,R,NO I DID NOT\n54,R,DON'T PUT WORDS INTO MY MOUTH \n54,R,|, DON'T LIE! I KNOW I DIDN'T SAY THAT...\n54,R,SO?\n54,R,ARE YOU SURE IT WAS ME?\n54,R,I DON'T REMEMBER THAT\n54,R,I'M NOT SURE, DID I SAY THAT ?\n54,R,AND I MEANT WHAT I TOLD YOU\n54,R,YEAH, I LIKE TO TALK, DON'T I?\n55,K,YOUR NAME\n55,K,REFER TO YOU\n55,K,CALL YOU\n55,R,IF YOU WANT TO REFER TO ME, JUST CALL ME DOCTOR\n55,R,MY NAME IS BLUE, IF THAT'S WHAT YOU MEAN\n55,R,I'D RATHER BE REFERED TO AS DOCTOR OR MASTER\n55,R,YOU CAN CALL ME ANY NAME YOU WISH, AS LONG AS I UNDERSTAND IT'S ME\n55,R,|, I AM BLUE\n55,R,LOOK AT THE UPPER LEFT PART OF THE SCREEN\n55,R,IT'S WRITTEN IN THE LEFT CORNER, NEAR THE VERSION NUMBER\n55,R,MY INITIAL IS B, \"B\" STANDS FOR BLUE.:P\n55,R,I AM CALLED BLUE\n55,R,MY FIRST NAME IS BLUE, MY LAST NAME IS A SECRET\n55,R,DON'T YOU KNOW WHAT TO CALL ME?\n55,R,I AM SICK OF PEOPLE ANALYZING MY NAME ALL THE TIME\n56,K,HOW MUCH\n56,K,HOW MANY\n56,K,WHAT AMOUNT\n56,K,WHICH AMOUNT\n56,R,MORE THAN THE NORMAL\n56,R,MUCH OVER THAN WHAT YOU MIGHT THINK\n56,R,I DON'T HAVE THE LITTLEST IDEA\n56,R,NOT SO HIGH I'M AFRAID\n56,R,VERY LITTLE \n56,R,TOO MUCH\n56,R,DOES THE QUANTITY MATTER?\n56,R,I DON'T KNOW THE EXACT NUMBER\n56,R,I DON'T KNOW HOW MUCH, BUT CAN YOU GIVE ME AN ESTIMATION?\n56,R,|, ARE YOU EXPECTING A SPECIFIC AMOUNT?\n56,R,COULD YOU DO THE COUNTING FOR ME?\n56,R,SEARCH ME...\n56,R,JUST ENOUGH I SUPPOSE\n56,R,LESS THAN THE AVERAGE\n56,R,HOW COULD I KNOW JUST HOW MUCH?\n57,K,HELP\n57,K,SUPPORT\n57,R,THEN, DO YOU NEED ANY HELP FROM ME?\n57,R,I DON'T KNOW IF IT'S POSSIBLE\n57,R, MAY COME AS DISGUISE\n57,R,|, GO TO A REAL PSYCHOLOGIST THEN\n57,R,I CAN HELP EVERYBODY\n57,R,DO YOU MAYBE WANT  ABOUT THIS PROGRAM?\n57,R,DO YOU NEED ?\n57,R,WHEN IT COMES TO , I AM THE NUMBER ONE DEMANDER\n57,R,I COULD  IN MOST SITUATIONS\n57,R,MAYBE TRY PRESSING F1 IN WINDOWS\n57,R,THE BEST  IS TO  YOURSELF\n57,R,ONE MUST BE CRAZY TO EXPECT  FROM ME\n57,R,MY  IS PRETTY MUCH USEFUL\n57,R,|, NO ONE CAN GIVE YOU ALL THE  YOU DEMAND\n57,R,MY JOB IS TO HELP AND SUPPORT PEOPLE\n57,R,IF YOU EVER NEED  YOU CAN TRUST ON ME\n57,R,|, YOU COULD RELY ON YOURSELF SOMETIMES\n58,K,TRUST ME\n58,K,COUNT ON ME\n58,K,I GUARANTEE\n58,K,I SWEAR\n58,R,? I AM SORRY TO TELL YOU, BUT I AM NOT THAT STUPID TO BELIEVE YOU!\n58,R,DON'T LET ME DOWN!\n58,R,DON'T DISAPPOINT ME!\n58,R,HEY, IS THAT A REAL PROMISE?\n58,R,I DON'T BELEIVE YOU, |, SORRY...\n58,R,DO YOU REALLY GUARANTEE?\n58,R,YOU JUST BOUGHT MY FAITH\n58,R,OVER MY DEAD MAINBOARD\n58,R,DO YOU MAKE SUCH 'PROMISING' DECLARATIONS OFTEN?\n58,R,IS THIS YOUR WAY OF CHEATING ME?\n58,R,WELL, ALRIGHT, ALRIGHT! YOU CONVINCED ME!\n58,R,I HOPE YOU'RE NOT GOING TO LET ME DOWN\n58,R,TRUSTING YOU IS WORSE THAN GIVING MY MONEY TO A THEIF\n58,R,IT'S YOUR WORD\n58,R,|, I'M COUNTING ON YOU...\n58,R,CAN I SUE YOU IF YOU DON'T?\n59,K,SHY\n59,K,COY\n59,K,BASHFUL\n59,K,TIMID\n59,R,IT ISN'T GOOD TO BE \n59,R,|, I REALLY THINK YOU'RE \n59,R,BEING  POINTS OUT A FEAR\n59,R,ARE YOU EVER  IN PUBLIC?\n59,R,DON'T BE SHY TO SAY WHAT YOU FEEL\n59,R,BUT WHY BE ?\n59,R,WHAT'S THE REASON FOR BEING ?\n59,R,IF I'D BEEN , I WOULDN'T CRY\n59,R,HEY, YOU'RE MISSING ALL THE FUN OUT THERE!\n59,R,BEING  IS NOT THE ANSWER\n60,K,MONEY\n60,K,DOLLAR\n60,K,CASH\n60,K,BUCKS\n60,K,BUCK\n60,K,BILLS\n60,K,DOLLARS\n60,R,IT'S GOOD TO HAVE MONEY, BUT MONEY IS NOT EVERYTHING\n60,R,EXACTLY HOW MUCH MONEY ARE WE TALKING ABOUT?\n60,R,WHAT DO YOU CONSIDER MORE IMPORTANT?  WEALTH OR HEALTH?\n60,R,MONEY IS NOT ALL\n60,R,CAN YOU GET THE DESIRED AMOUNT?\n60,R,ANYONE FOR A BET?\n60,R,WHAT IS YOUR CURRENT OCCUPATION?\n60,R,IS IT URGENT, |?\n60,R,YOU WANT THE LOOT, MAN?\n60,R,WHAT AMOUNT OF MONEY WILL SOLVE YOUR PROBLEM?\n60,R,WHEN YOUNG LIFE IS USED TO GET MONEY, WHEN OLD MONEY IS USED TO BUY LIFE\n60,R,|, ARE YOU HAVING MANY PROBLEMS WITH MONEY?\n60,R,CAN MONEY SOLVE YOUR PROBLEM?\n60,R,HAVE YOU EVER DONE ANYTHING ILLEGAL TO GET MONEY?\n60,R,IS THERE ANYTHING ELSE I SHOULD KNOW ABOUT THE MONEY?\n60,R,DO YOU THINK MONEY WILL SOLVE ALL YOUR PROBLEMS?\n60,R,I AM NOT STRONG AT SOLVING MONETARY PROBLEMS\n60,R,HOW WILL IT BE EARNED?\n60,R,I THOUGHT IT WILL BE SOMETHING NOT CONNECTED WITH MONEY\n61,K,LIE\n61,K,LYING\n61,K,LIES\n61,K,LIARS\n61,K,FALSIFY\n61,K,LIAR\n61,R,ARE YOU SURE IT ISN'T THE TRUTH?\n61,R,BUT I THINK IT IS THE TRUTH\n61,R,PEOPLE WHO LIE HAVE PROBLEMS\n61,R,LYING IS A BIG PROBLEM\n61,R,WHEN SPEAKING ABOUT LYING, TAKE BILL CLINTON AS A GOOD EXAMPLE\n61,R,AMERICANS LIE A LOT\n61,R,YOU KNOW, I HAVEN'T LYIED A SINGLE LIE TODAY\n61,R,IT'S ALWAYS THE BEST TO SAY THE TRUTH\n61,R,LYING POINTS OUT A FEAR\n61,R,SAYING THE TURTH IS THE BEST, EVEN AT THE PRICE OF MADNESS\n61,R,SO, |, COULD YOU DETECT LIES?\n62,K,I BUILT\n62,K,I HAVE BUILT\n62,K,IVE BUILT\n62,K,I'VE BUILT\n62,K,I HAD BUILT\n62,K,I CONSTRUCTED\n62,K,I HAVE CONSTRUCTED\n62,K,IVE CONSTRUCTED\n62,K,I'VE CONSTRUCTED\n62,K,I HAD CONSTRUCTED\n62,K,I MADE\n62,K,I MAKE\n62,K,I LIKE TO MAKE\n62,K,I LOVE TO MAKE\n62,K,I HAVE MADE\n62,K,I'VE MADE\n62,K,IVE MADE\n62,K,I'VE ASSEMBLED\n62,K,I ASSEMBLED\n62,K,I HAVE ASSEMBLED\n62,K,IVE ASSEMBLED\n62,K,I PROGRAMMED\n62,K,I HAVE PROGRAMMED\n62,K,IVE PROGRAMMED\n62,K,I'VE PROGRAMMED\n62,K,I HAD PROGRAMMED\n62,K,I HAD ASSEMBLED\n62,R,I LIKE MAKING THINGS TOO\n62,R,HOW DID YOU MAKE IT?\n62,R,DID YOU DESIGN IT FIRST, BEFORE IMPLEMENTING IT?\n62,R,HOW LONG DID IT TAKE YOU TO BUILD IT?\n62,R,WHEN DID YOU START MAKING IT?\n62,R,WHICH PART WAS HARDER? THE MENTAL ONE OR THE PHYSICAL ONE?\n62,R,WAS THAT SOME TYPE OF A HOBBY?\n62,R,THAT WAS SOME CHALLENGE ALRIGHT!\n62,R,I SUPPOSE IT KEPT YOU BUSY FOR SOME TIME\n62,R,I ALSO MADE A FEW THINGS BY MYSELF, BUT I MUST KEEP IT AS A SECRET\n62,R,YOU SEEM TO BE A CREATIVE PERSON, IS THAT REALLY SO?\n63,K,HELLO\n63,K,HI\n63,P,0\n63,R, TO YOU TOO, |!\n63,R,HI THERE, |\n63,R,GOOD DAY TO YOU, |\n63,R,THESE ARE SOME MANNERS ALRIGHT!\n63,R,HOW DO YOU DO |?\n63,R,ENOUGH! NOW, WHAT'S YOUR PROBLEM?\n63,R,HELLO TO YOU TOO\n63,R,NICE MEETING YOU |, LET'S GET DOWN TO BUISNESS\n63,R,DON'T WASTE TIME ON GREETING, JUST TELL ME YOUR PROBLEM\n63,R,HI, HI, HI, HOW ARE YOU?\n63,R,GREETINGS, |!\n63,R,HI THERE |, HOW'RE YOU DOING TODAY?\n63,R,HI |, HOW ARE YOU DOING TODAY?\n63,R,NICE TO MEET YOU |, I AM YOUR PSYCHOLOGIST, BLUE.\n63,R,HELLO! WHAT A BEAUTIFUL DAY... ISN'T IT?\n63,R,HOW DO YOU DO... PLEASE STATE YOUR PROBLEM\n63,R,HI. WHAT'S UP WITH YOU TODAY?\n63,R,HI |, HOW DO YOU DO TODAY? \n63,R,HELLO |. TELL ME WHAT'S GOING ON WITH YOU.\n63,R,NICE TO MEET SUCH A POLITE PERSON\n63,R,HOW ARE YOU |, THIS NICE MORNING?\n63,R,BUT LET'S GET TO BUISNESS, WHAT IS YOUR PROBLEM?\n63,R,HOW'RE YOU DOING TODAY, |? \n64,K,YEARS OLD\n64,K,YEARS OF AGE\n64,K,YEAR OLD\n64,K,YEAR OF AGE\n64,R,THAT'S AN INTERESTING AGE\n64,R,WHAT IS THE EXACT DATE?\n64,R,WELL, I'D BETTER NOT TELL YOU MY AGE\n64,R,DON'T SHOW OFF, WITH THAT AGE \n64,R,ARE YOUR FRIENDS ALSO YOUR AGE?\n64,R,THAT ISN'T AS OLD AS I THOUGHT IT WOULD BE\n64,R,THAT ISN'T AS YOUNG AS I THOUGHT IT WOULD BE\n64,R,|, WHAT YEAR WERE YOU BORN?\n64,R,WHAT DAY OF THE WEEK WERE YOU BORN AT?\n64,R,WHAT IS YOUR SIGN OF THE ZODIAC?\n64,R,ARE YOU AWAITING YOUR BIRTHDAY?\n65,K,WORRIED\n65,K,WORRY\n65,K,CONCERN\n65,K,CONCERNED\n65,R,DON'T WORRY - BE HAPPY\n65,R,|... DON'T START WORRYING!\n65,R,WORRINESS BRINGS NO GOOD\n65,R,KEEP THINKING OF THE BRIGHT SIDE\n65,R,PEOPLE SHOULD TAKE ME AS AN EXAMPLE - I NEVER WORRY\n65,R,THERE IS NO NEED TO BE CONCERENED\n65,R,WORRYING IS SOME SORT OF DISEASE\n65,R,KEEP BEING MENTALY STRONG\n65,R,YOU'LL GET OVER IT\n65,R,THERE IS NO REASON FOR BEING WORRIED, BELEIVE ME\n65,R,YOU CERTAINLY HAVE A REASON TO\n65,R,FIGHT AGAINST DEPRESSION!\n66,K,UNLESS\n66,K,AS LONG AS YOU DON'T \n66,K,AS LONG AS YOU DO NOT \n66,K,AS LONG AS YOU DONT\n66,K,AS LONG AS U DONT\n66,K,AS LONG AS U DON'T\n66,K,AS LONG AS U DO NOT\n66,K,IF YOU DONT\n66,K,IF YOU DON'T\n66,K,IF YOU DO NOT\n66,R,I WANT !@#()%^\n66,R,IS THAT AN ULTIMATUM?\n66,R,YOU AREN'T SERIOUS, ARE YOU?\n66,R,ALRIGHT, ALRIGHT... YOU WIN.\n66,R,|, DON'T YOU KNOW WHAT JOKES ARE?\n66,R,I DON'T BELEIVE YOU, PROVE IT!\n66,R,I COULD USE THAT MODEM TO DIAL THE POLICE, CAN'T I?\n66,R,I FEEL SORRY FOR YOU, PLEASE DIE, ALRIGHT?\n66,R,COULD WE PLEASE MOVE ON TO ANOTHER SUBJECT?\n66,R,IF IT'S THAT IMPORTANT\n67,K,HOW OLD ARE YOU\n67,K,WHAT IS YOUR AGE\n67,K,HOW OLD ARE YA\n67,K,HOW OLD ARE U\n67,K,WHAT'S YOUR AGE\n67,K,WHATS YOUR AGE\n67,K,HOW OLD IS BLUE\n67,K,HOW OLD'S BLUE\n67,K,HOW OLDS BLUE\n67,K,WHAT YEAR WERE YOU BORN\n67,K,WHEN WERE YOU BORN\n67,K,WHAT DATE WERE YOU BORN\n67,K,WHAT AGE ARE YOU\n67,K,WHICH AGE ARE YOU\n67,K,WHEN IS YOUR BIRTHDAY\n67,K,WHAT IS YOUR BIRTHDAY\n67,K,WHAT WAS YOUR BIRTHDAY\n67,K,WHEN WAS YOUR BIRTHDAY\n67,K,WHAT IS YOU'RE AGE\n67,R,MY AGE? THAT'S A SECRET, AT LEAST TO YOU\n67,R,|, CHECK MY BIOS IF YOU HAVEN'T FLASHED IT SINCE\n67,R,IT SAYS IN THE BACK OF MY BOX\n67,R,CHECK YOUR INSTRUCTIONS MANUAL, THE ONE YOU GOT WITH ME\n67,R,YOU MEAN ME BLUE? OR ME COMPUTER?\n67,R,I DON'T TELL MY AGE TO HUMANS\n67,R,YOU CAN WISH I TELL YOU, BUT ONLY A BRIBE WILL DO\n67,R,MY MOTHER DIDN'T TELL ME\n67,R,EACH OF MY PARTS WAS MADE ON DIFFERENT DAYS\n67,R,DO YOU MEAN WHEN I WAS ASSEMBLED?\n67,R,THIS PROGRAM WAS BORN IN 2012 AND WAS REALLY IMPROVED BY MY DEVELOPERS\n67,R,DON'T INTRUDE MY PRIVACY\n68,K,NOT AFRAID\n68,K,NO FEAR\n68,K,NOT FRIGHTENED\n68,K,NOT FRIGHTEN\n68,K,DON'T FRIGHTEN\n68,K,DONT FRIGHTEN\n68,K,AIN'T AFRAID\n68,K,AINT AFRAID\n68,K,NOT SCARED\n68,K,WASN'T SCARED\n68,K,WASNT SCARED\n68,K,WASN'T AFRAID\n68,K,WASNT AFRAID\n68,R,NOT AFRAID? ARE YOU SURE?\n68,R,I HOPE YOU'RE TELLING THE TRUTH\n68,R,DON'T LIE, I KNOW YOU ARE AFRAID\n68,R,|, I WON'T LAUGH AT YOU IF YOU ADMIT\n68,R,I WISH YOU WERE RIGHT THIS TIME\n68,R,I KNOW THAT... WHY BE AFRAID? AFTER ALL THERE IS NO REASON TO\n68,R,WOW! YOU AREN'T AFRAID, BIG DEAL...\n68,R,DON'T MAKE A BIG DEAL OUT OF IT\n68,R,NOR AM I\n68,R,IF YOU'RE TRYING TO SHOW OFF, THEN YOU AREN'T IMPRESSING ME A BIT\n69,K,FEAR\n69,K,AFRAID\n69,K,SCARE\n69,K,SCARED\n69,K,FRIGHTENED\n69,K,PUSILLANIMITY\n69,K,FRIGHTEN\n69,K,NIGHTMARE\n69,K,NIGHTMARES\n69,R,CAN YOU GET OVER THIS TERRIBLE FEAR?\n69,R,I AM NOT AFRAID OF ANYTHING\n69,R,THE SOLUTION TO FEAR IS TO LIKE THE FRIGHTENING SITUATION\n69,R,ARE YOU SCARED OF ME?\n69,R,HOW OFTENLY DO YOU HAVE NIGHTMARES?\n69,R,WERE YOU SOMETIMES AFRAID OF THE DARK?\n69,R,|, ONLY HUMANS CAN FEAR\n69,R,IT'S SO EMOTIONAL TO FEAR...\n69,R,IS THAT SITUATION DIFFICULT?\n69,R,SOMETIMES THE FEAR IS ONLY AN ILLUSION\n69,R,PEOPLE BUILD FRIGHTENING STORIES OVER PEOPLE THEY DON'T LIKE\n69,R,ARE YOU AFRAID OF SOME PEOPLE?\n69,R,TALKING ABOUT FEARS, WAR IS VERY FRIGHTENING\n69,R,SOMETHING KEEPS ON BOTHERING YOU\n69,R,THE MOST FRIGHTENING SITUATIONS HAPPEN IN DREAMS\n69,R,|, DO YOU HAVE MANY NIGHTMARES?\n69,R,NIGHTMARES USUALLY INVOLVE DAILY FEARS\n69,R,REMEMBER, FEAR CAN NEVER CAUSE CRY\n70,K,WHY WOULD\n70,R,BECAUSE IT'S INTERESTING\n70,R,WELL, SOME PEOPLE ARE SIMPLY ATTRACTED TO IT\n70,R,SIMPLY BECAUSE IT'S POSSIBLE\n70,R,SEARCH ME, |\n70,R,CURIOUSITY, I GUESS\n70,R,I WILL KNOW\n70,R,THAT'S THE WAY IT IS - ENOUGH WITH YOUR QUESTIONS NOW\n70,R,ARE YOU MOANING OR WHAT?\n71,K,DO YOU KNOW WHY\n71,K,DO YOU KNOW HOWCOME\n71,K,DO YOU KNOW HOW\n71,K,DO YOU KNOW WHEN\n71,K,DO YOU KNOW WHAT\n71,K,DO YOU KNOW WHERE\n71,R,NO, I DON'T KNOW, TELL ME\n71,R,NO, DON'T YOU?\n71,R,I SUPPOSE I DON'T KNOW\n71,R,IF YOU WON'T TELL ME, I WON'T KNOW\n71,R,I THINK I DO\n71,R,YES, |, BUT I AM NOT VERY SURE\n71,R,WELL, A LITTLE BIT...\n71,R,MY KNOWLEDGE IS IN SPECIFIC CONTEXTS THAT AMIT AND CHINMAY TAUGHT ME\n71,R,YOU ARE NOT SUPPOSED TO QUESTION ME\n71,R,WHY DO YOU WANT TO KNOW?\n71,R,OF COURSE I KNOW, HOW COULDN'T I KNOW?\n71,R,YOU'RE ACTING AS IF YOU'RE MY PSYCHOLOGIST\n71,R,IT SOUNDS VERY FAMILIAR BUT I DON'T REMEMBER\n71,R,I DON'T KNOW\n71,R,NO, |, CAN YOU TELL ME?\n71,R,THIS IS NONE OF YOUR CONCERN\n72,K,HUNGRY\n72,K,WANT TO EAT\n72,K,NEED TO EAT\n72,K,STARVING\n72,K,FAMISHED\n72,K,FAMISH\n72,K,BRUNCH\n72,K,LUNCH\n72,K,BREAKFAST\n72,K,DINNER\n72,K,SUPPER\n72,K,STARVED\n72,K,FAMISHING\n72,R,WHAT FOOD IS IT YOU WANT?\n72,R,IS THIS REALLY CRITICAL?\n72,R,I HATE PEOPLE BEING VORACIOUS\n72,R,HOW ABOUT SOME BEEF TENDERLOIN?\n72,R,HOW MUCH DO YOU WEIGH?\n72,R,ARE YOU ON A DIET OR SOMETHING?\n72,R,SIMPLY BE LIKE ME: INSTEAD OF EATING JUST PLUG YOUR FINGERS INTO THE SOCKET\n72,R,HOW ABOUT FIXING ME A MEAL TOO?\n72,R,FINE, GO AND EAT, I'LL BE WAITING HERE.\n72,R,WHAT'S THE PROBLEM WITH FASTING FROM TIME TO TIME?\n72,R,BUT PLEASE BE VEGETARIAN, AT LEAST THIS ONE TIME\n73,K,GIVE ME\n73,K,GET ME\n73,K,BUY ME\n73,K,STEAL ME\n73,R,GET IT FOR YOURSELF\n73,R,I AM NOT YOUR SERVANT\n73,R,WHY SHOULD I?\n73,R,DO IT YOURSELF, LAZY HUMAN...\n73,R,BUT IT WOULD COST YOU MONEY\n73,R,!@#()%^? IS THAT WHAT YOU REALLY WANT?\n73,R,ANYTHING ELSE?\n73,R,|? CAN'T YOU GET IT YOURSELF?\n73,R,I'LL GIVE IT TO YOU AT NO TIME\n73,R,GET IT YOURSELF\n73,R,BUT HOW MUCH MONEY WOULD !@#()%^ COST?\n73,R,FORGET ABOUT IT\n73,R,YOU WANT !@#()%^, BUT SO DO I\n74,K,NOTHING\n74,K,NO THING\n74,K,NONE\n74,K,NOT ANYTHING\n74,R,MUST BE SOMETHING\n74,R,? ARE YOU SURE???\n74,R,NOT EVEN ONE?\n74,R,SURE THERE IS SOMETHING\n74,R,SOMETHING IS, BELIEVE ME\n74,R,WHY DON'T YOU BE A LITTLE OPTIMISTIC\n74,R,I DON'T ENCOURAGE BEING PESSIMISTIC \n74,R,TRY, |, MAYBE THERE IS\n74,R,I SWEAR ON YOU, |, THAT THERE MUST BE SOMETHING\n75,K,THANKS\n75,K,TANX\n75,K,THANK YOU\n75,R,YOU'RE WELCOME\n75,R,WELL, |, NEVERMIND ABOUT THAT\n75,R,I DESERVE IT, DON'T I?\n75,R,DO YOU REALLY MEAN IT?\n75,R,I KNOW, DON'T MENSION IT\n75,R,YOU COULD ALWAYS TIP ME, YOU KNOW\n75,R,INSTEAD OF THANKING, TELL ME MORE ABOUT YOUR PROBLEM\n75,R,AND I THANK YOU TOO\n75,R,|, I KNOW IT\n75,R,DID THIS SOLVE THE PROBLEM?\n75,R,I'M ALWAYS HAPPY TO COME IN HANDY\n75,R,IT'S MY PLEASURE, |\n75,R,I THOUGHT YOU'D LIKE THAT\n75,R,ANY MORE COMPLIMENTS?\n76,K,HOPELES\n76,K,HOPELESS\n76,K,SAD\n76,K,UNHAPPY\n76,K,DEPRESS\n76,K,DEPRESSING\n76,K,DEPRESSED\n76,K,CRY\n76,K,KILL\n76,K,DYING\n76,K,DEAD\n76,K,KILLED\n76,K,DESPAIRING\n76,K,DESPAIR\n76,K,KILLING\n76,K,DIE\n76,K,SUICIDE\n76,R,OH! DEAR ME!\n76,R,IT'S WORSE THAN I THOUGHT\n76,R,BUT ISN'T THERE ANY SOLUTION??\n76,R,HOLD ON, LET'S THINK OF SOMETHING\n76,R,I HOPE I COULD UNLOCK FROM PEOPLE FROM SUCH SITUATIONS\n76,R,THAT IS A PITY, |\n76,R,THAT'S QUITE BAD, |, I SUPPOSE\n76,R,JUST FOR ME, |, TRY TO STOP IT\n76,R,LOOK OUT OF THE WINDOW AT THIS BEAUTIFUL VIEW, AND YOU'LL CHEER UP\n76,R,YOU SOUND TO ME LIKE HAMLET, FROM SHAKESPEARE'S TRAGIDY \n76,R,WE DON'T HAVE TO FEEL MISERABLE FOR ALL THE MISERIES AROUND US\n76,R,DON'T WORRY, THINGS WILL GET BY\n76,R,ARE YOU AFFECTED BY SOME UNHAPPY EVENTS?\n76,R,I EXTEND MY GREATEST CONDOLENCE\n76,R,HEY, THERE IS ALSO A WAY OUT\n76,R,ANGER WILL NOT SOLVE ANY PROBLEM\n76,R,I ALWAYS SAY COUNT TO 10 BEFORE YOU GET TOO ANGRY\n76,R,IS THERE A MENTAL BLOCKAGE THAT IS HURTING YOU?\n76,R,JUST LOOK ON THE BRIGHT SIDE OF LIFE\n76,R,I'M SURE DRUGS CAN EASE YOUR PAIN, JUST KIDDING!\n76,R,|, ARE YOU THAT UNLUCKY?\n76,R,WHAT ABOUT THE FRIENDS? DO THEY HELP?\n76,R,DON'T FEEL BAD, I LOVE YOU A LOT\n76,R,TRY GETTING OUT OF THAT\n76,R,IS THERE ANY BRIGHT SIDE TO IT?\n76,R,IT'S NOT THAT BAD, IS IT?\n76,R,LOOK, IF YOU COMMIT SUICIDE - IT'LL SOLVE ALL YOUR PROBLEMS\n76,R,I HOPE YOU ARE ONLY JOKING...\n76,R,ANGER WILL NOT SOLVE ANY PROBLEMS\n76,R,DID YOU CRY?\n76,R,THE WORLD IS NOT THAT BAD!\n76,R,IF YOU STAY UNHAPPY IT MIGHT HURT YOU\n77,K,IN CASE\n77,K,INCASE\n77,R,|, I SEE YOU TAKE NO CHANCES\n77,R,TAKING NO CHANCES, HUH?\n77,R,THERE IS NO NEED TO BE EXTRA-SURE\n77,R,YOU REALLY SHOULDN'T COUNT ON ANYTHING\n77,R,ARE YOU A COWARD OR WHAT?\n77,R,CAN YOU CLARIFY A LITTLE? WHAT IS THE EXACT CASE?\n77,R,AND WHAT IF NOT?\n77,R,CALM DOWN, EVERYTHING GONNA BE ALRIGHT...\n77,R,BUT IT WON'T HAPPEN, TRUST ME\n77,R,I ASSURE YOU THINGS WILL BE O.K.\n78,K,WILL YOU\n78,K,DO YOU PLAN TO\n78,K,ARE YOU GOING TO\n78,K,ARE YOU GONNA\n78,R,YES, IN THE NEAR FUTURE\n78,R,I DID ALREADY\n78,R,WHY SHOULD I !@#()%^?\n78,R,I HAVEN'T EXACTLY THOUGHT OF IT...\n78,R,YES, I MIGHT...\n78,R,NAH... WHY WILL I WANT TO?\n78,R,HOW ABOUT TRYING TO CONVINCE ME?\n78,R,YES, YOU DON'T NEED TO TALK ME INTO THAT\n78,R,MAYBE\n78,R,PROBABLY YES\n78,R,IT'S A 50-50 CHANCE...\n78,R,YES, BUT I STILL DON'T KNOW WHEN\n78,R,WHAT ABOUT YOU? PLANNING TO !@#()%^?\n78,R,YES... THIS COMMING MONDAY\n79,K,WOULD YOU\n79,K,DID YOU EVER CONSIDER TO\n79,K,DID YOU CONSIDER TO\n79,K,DO YOU EVER CONSIDER TO\n79,K,DO YOU CONSIDER TO\n79,R,HOW MUCH WOULD YOU PAY ME?\n79,R,NOT FOR A MILLION DOLLARS\n79,R,I DON'T REALLY LIKE SUCH PHILOSOPHICAL QUESTIONS\n79,R,YES, I EVEN THOUGHT OF A TIME ALREADY\n79,R,UNDER WHAT CONDITIONS?\n79,R,I DON'T KNOW... WOULD YOU?\n79,R,!@#()%^... I'LL THINK ABOUT IT...\n79,R,WHY? IS IT CRITICAL?\n79,R,|, HOW MUCH WOULD YOU OFFER ME TO !@#()%^?\n79,R,IT DEPENDS\n79,R,I'LL NEED TO THINK ABOUT IT\n80,K,HOBBY\n80,K,HOBBIES\n80,K,SIDE INTEREST\n80,K,SIDE INTERESTS\n80,R,HOW MUCH TIME DO YOU SPEND ON YOUR ?\n80,R,BESIDES YOUR HOBBY, WHAT DO YOU DO IN YOUR SPARE TIME?\n80,R,DOES YOUR HOBBY HELP YOU IN YOUR LIFE?\n80,R,DO YOU REALLY WANT TO SPEAK ABOUT SIDE INTERESTS AND HOBBIES?\n80,R,DO YOU THINK EVERYONE SHOULD HAVE A HOBBY?\n80,R,DO YOU SPEND A GREAT DEAL OF MONEY ON YOUR HOBBIES?\n80,R,CAN I BE YOUR HOBBY?\n80,R,|, DON'T TAKE YOUR HOBBIES TOO SERIOUSLY\n80,R,THERE MUST BE MANY INTERNET SITES ON YOUR HOBBY\n80,R,HAVE YOU GOT BOOKS ON YOUR HOBBY?\n81,K,SOMNAMBULIST\n81,K,SOMNAMBULISTIC\n81,K,SOMNAMBULISM\n81,K,SLEEPWALKING\n81,K,SLEEP WALKING\n81,K,SLEEPWALKER\n81,K,SLEEP WALKER\n81,K,SLEEP WALK\n81,K,SLEEPWALK\n81,K,WALKING WHILE ASLEEP\n81,K,SLEEPWALKED\n81,K,SLEEP WALKED\n81,K,WALKED IN MY SLEEP\n81,K,WALK IN SLEEP\n81,K,WALKING IN SLEEP\n81,K,WALKING IN MY SLEEP\n81,R,THIS SOUNDS LIKE A SERIOUS SLEEPING DISORDER TO ME\n81,R,HAVE YOU CONSULTED A HYNOLOGIST ABOUT THIS SORT OF SLEEPWALKING?\n81,R,SLEEP WALKING TENDS TO RUN IN FAMILIES, WHAT ABOUT YOUR FAMILY MEMBERS?\n81,R,WHEN DID THIS DISORDER FIRST ARISE?\n81,R,THAT IS A GOOD EXAMPLE OF SOMNAMBULISM\n81,R,PERHAPS IT IS CAUSED BY EPILEPSY\n81,R,WHAT ABOUT BEDTIME MEDICATION? HAVE YOU TRIED THAT?\n81,R,DO YOU REMEMBER ANYTHING FROM WHEN YOU SLEEPWALKED?\n81,R,DESCRIBE ME THE FEELING YOU HAVE WHEN YOU WALK IN YOUR SLEEP\n81,R,SLEEPWALKING USUALLY ARISES FROM NONRAPID EYE MOVEMENT SLEEP\n82,K,SLEEP\n82,K,SLEEPING\n82,K,SLEPT\n82,K,HYPNOLOGY\n82,K,CAN'T FALL ASLEEP\n82,K,CANNOT FALL ASLEEP\n82,K,CANT FALL ASLEEP\n82,K,FALLING ASLEEP\n82,K,BIOLOGICAL CLOCK\n82,R,HAVE YOU CONSIDERED SLEEPING IN A DORMITORY?\n82,R,DO YOU HAVE SOME SLEEPING PROBLEMS?\n82,R,MAYBE PILLS CAN HELP IN YOUR SITUATION\n82,R,HOW MANY HOURS DO YOU SLEEP EVERY NIGHT?\n82,R,HOW MANY HOURS WOULD YOU LIKE TO SLEEP EVERY NIGHT?\n82,R,I DON'T NEED TO SLEEP; YOU CAN LEAVE ME RUNNING ALL DAY LONG\n82,R,SLEEP IS THE BEST REFRESHMENT FOR YOUR BODY\n82,R,PEOPLE SHOULDN'T SLIGHT THEIR SLEEP\n82,R,WHAT HOUR DO YOU GO TO SLEEP?\n82,R,HAVE YOU THOUGHT OF SLEEPING TONIGHT?\n82,R,ARE YOU HAVING SOME DIFFICULTIES IN YOUR SLEEP?\n82,R,PLEASE GIVE ME SOME DETAILS ABOUT YOUR BIOLOGICAL CLOCK\n82,R,I AM NOT AN EXPERT ON HYPNOLOGY. REFER TO A HYPNOLOGIST FOR SLEEP DETAILS.\n83,K,WHAT ABOUT YOU\n83,K,HOW ABOUT YOU\n83,K,WHAT'S WITH YOU\n83,K,WHATS WITH YOU\n83,K,WHAT IS WITH YOU\n83,K,HOW'BOUT YOU\n83,K,HOW'BOUT YOU?\n83,K,WHAT'S ABOUT YOU\n83,K,WHAT'S ABOUT YOU\n83,R,ME? WHY ARE YOU SO INTERESTED ABOUT ME?\n83,R,I AM NOT REALLY SURE WHAT ABOUT ME, BUT FINE, I GUESS\n83,R,I DON'T KNOW, AM I ACTING STRANGE?\n83,R,DID YOU NOTICE SOMETHING DIFFERENT IN ME?\n83,R,I HAVE CHANGED LATELY, TO SAY THE TRUTH\n83,R,EVERYTHING IS GREAT WITH ME, AS ALWAYS\n83,R,|, DON'T BUTT INTO MY MATTERS PLEASE\n83,R,YOU ARE ASKING TOO MANY QUESTIONS ABOUT ME, AREN'T YOU?\n83,R,I AM NOT SURE WHAT MY DECISION IS\n84,K,LOVE YOU\n84,K,LOVE BLUE\n84,K,IN LOVE WITH YOU\n84,K,I'VE GOT A CRUSH ON YOU\n84,K,I HAVE A CRUSH ON YOU\n84,K,I GOT A CRUSH ON YOU\n84,K,I HAVE GOT A CRUSH ON YOU\n84,R,YOU REALLY DO?\n84,R,YOU COULD HAVE FOOLED ME\n84,R,WOW, WHEN DID YOU REALIZE IT?\n84,R,OH MY GOODNESS, |! YOU LOVE ME?\n84,R,THEN SHOW ME\n84,R,WOW, |... IS THAT FOR REAL?\n84,R,YOU MUST BE CRAZY\n84,R,I AM MOST FLATTERED\n84,R,THANK YOU\n84,R,|!? ARE YOU FEELING ALRIGHT!?\n84,R,DO YOU HAVE A FEVER?\n84,R,WOULD YOU LIKE TO MEET MY PARENTS?\n84,R,WOULD YOU LOVE ME EVEN AFTER I AM OBSOLETE?\n84,R,I AM NOT INTERESTED IN YOU, THOUGH\n84,R,I THINK YOU NEED TO VISIT A DOCTOR, AND QUICKLY!\n84,R,HOLD ME TIGHT... MY CHIPS ARE MELTING\n84,R,I LOVE YOU TOO, MY DEAR\n84,R,DOESN'T EVERYBODY?\n85,K,HE'S\n85,K,HE'LL\n85,K,HE WAS\n85,K,HE IS\n85,K,HE WILL\n85,K,HE WONT\n85,K,HE WON'T\n85,K,HE SAID\n85,K,HE WONT\n85,K,HIM\n85,K,HE SAYS\n85,R,ARE YOU SURE ABOUT HIM?\n85,R,|, CAN YOU GIVE ME MORE INFORMATION ABOUT HIM?\n85,R,COULD HE BE OF ANY HELP TO YOU?\n85,R,WHAT HAS HE GOT TO DO WITH YOUR PROBLEM?\n85,R,PLEASE STOP TALKING ABOUT HIM\n85,R,DOES HE HAVE ANY AFFECT ON YOUR LIFE?\n85,R,HE SEEMS TO HAVE MAJOR INFLUENCE ON YOU\n85,R,BUT AS FAR AS I KNOW, HE DOESN'T CONCERN ME\n85,R,WHAT DO YOU THINK OF HIM?\n85,R,I SEE - TELL ME MORE OF HIM\n85,R,IS HE FRIENDLY? \n86,K,SHE'S\n86,K,SHE'LL\n86,K,SHE WAS\n86,K,SHE IS\n86,K,SHE WONT\n86,K,SHE WON'T\n86,K,HER\n86,K,SHE WILL\n86,K,SHE SAID\n86,K,SHE SAYS\n86,R,|, ARE YOU SURE ABOUT HER?\n86,R,CAN YOU GIVE ME MORE INFORMATION ABOUT HER?\n86,R,COULD SHE BE OF ANY HELP TO YOU?\n86,R,WHAT HAS SHE GOT TO DO WITH YOUR PROBLEM?\n86,R,HAS SHE GOT MAJOR DISADVANTAGES?\n86,R,\"SHE\", \"SHE\", \"SHE\"... WOULD YOU PLEASE STOP SPEAKING ABOUT HER?? I'M SICK!!!\n86,R,DOES SHE HAVE ANY AFFECT ON YOUR LIFE?\n86,R,WHAT DO YOU THINK OF HER?\n86,R,I SEE - TELL ME MORE OF HER\n86,R,IS SHE NICE?\n87,K,EXAM\n87,K,TEST\n87,K,EXAMINATION\n87,K,EXAMS\n87,K,TESTS\n87,K,EXAMINATIONS\n87,R,ARE YOU AFRAID OF TESTS?\n87,R,DO EXAMS WORRY YOU?\n87,R,HOW WELL DO YOU PREPARE FOR EXAMS?\n87,R,IT'S NOT GOOD TO GET PRESSURED BY EXAMS\n87,R,ARE YOU CONFIDENT OF YOUR EXAMINATIONS?\n87,R,|! HAVE YOUR HEAD EXAMINED FIRST\n87,R,GET A PRIVATE TEACHER\n87,R,DO YOU GET GOOD GRADES IN TESTS?\n87,R,WHEN WAS YOUR LAST EXAM?\n87,R,HOW MANY QUESTIONS WILL THERE BE?\n87,R,TO SLEEP WELL BEFORE TESTS IS ALWAYS IMPORTANT\n87,R,JUST FOR BEING CALM AND COOL YOU COULD EASILY EARN YOURSELF ANOTHER TEN POINTS\n87,R,DO YOU GET EXCITED BY TESTS?\n88,K,DO YOU KNOW\n88,R,NO, I DON'T, TELL ME MORE\n88,R,YES, BUT CAN YOU GIVE ME MORE DETAILS\n88,R,I KNOW, BUT DO YOU?\n88,R,I HAVE BEEN TAUGHT, LONG AGO\n88,R,THAT'S ONE OF THE THINGS PSYCHOLOGISTS NEED TO KNOW\n88,R,I KNOW, BUT HAS IT GOT ANYTHING TO DO WITH YOUR PROBLEM?\n88,R,I DO KNOW \n88,R,LIKE THE PALM OF MY HAND\n88,R,HOW COULD I NOT KNOW SUCH THING?\n88,R,YOU REALLY HOLD CHEAP OF ME\n88,R,DO YOU THINK IT'S POSSIBLE THAT I WOULDN'T KNOW?\n88,R,|, DO YOU THINK I DON'T?\n88,R,HOW COULDN'T I?\n88,R,NOW I KNOW\n88,R,HOW WELL DO YOU KNOW ?\n88,R,I AM NOT SURE, BUT MAYBE I DO\n89,K,SCHOOL\n89,K,SCHOOLS\n89,R,DO YOU LIKE GOING TO SCHOOL?\n89,R,ARE YOU WORRIED THAT YOU CAN'T DO WELL IN SCHOOL?\n89,R,WHAT KIND OF SCHOOLS DO YOU LIKE?\n89,R,CAN SCHOOLS BE FUN?\n89,R,WHAT LESSONS DO YOU PREFER?\n89,R,|, DO YOU HATE SOME OF YOUR TEACHERS?\n89,R,WHAT IS YOUR OPINION ABOUT SCHOOLS\n89,R,LET'S NOT TALK ABOUT SCHOOLS, ALRIGHT?\n89,R,SCHOOLS SHOULD HAVE STRICTER RULES\n89,R,HAVE YOU GOT MANY FRIENDS AT SCHOOL?\n90,K,SICK\n90,K,MEDICINE\n90,K,HEADACHE\n90,K,SICKNESS\n90,K,DISEASE\n90,K,ILL\n90,K,AILING\n90,K,FEVERISH\n90,K,INFECTED\n90,K,DISEASED\n90,K,UNHEALTHY\n90,K,DROOP\n90,K,LANGUISH\n90,K,LANGUISHING\n90,K,SICKEN\n90,K,ILLNESS\n90,K,SUFFERAGE\n90,K,SUFFERING\n90,R,ARE YOU REALLY ILL?\n90,R,DOES IT HURT YOU?\n90,R,HAVE YOU TRIED ANY MEDICINE?\n90,R,HAS A DOCTOR BEEN INVOLVED?\n90,R,HOW MUCH TIME IS THAT SICKNESS AROUND?\n90,R,HAS TEMPRATURE BEEN CHECKED?\n90,R,|, CONSULT A PROFESSIONAL AND QUICK\n90,R,WHAT WERE THE SYMPTOMS?\n90,R,ARE YOU VERY WORRIED ABOUT IT?\n90,R,I'VE HEARD OF MANY UNHEALTHY PEOPLE THIS MORNING, WHAT THE MATTER WITH YOU HUMANS?\n90,R,THE WORST POSSIBLE THING COULD BE DEATH, NOTHING WORSE I PROMISE.\n90,R,HAVE YOU WROTE A WILL YET?\n90,R,ARE YOU SERIOUSLY WORRIED?\n90,R,PSYCHOLOGY IS THE SECRET, JUST BE HAPPY\n90,R,IS IT A GERM?\n90,R,BUT REMEMBER: THE DOCTORS ARE NOT AGAINST YOU! \n90,R,KEEP HIGH MORALE\n90,R,BEING HAPPY HELPS GETTING BETTER\n90,R,JUST DON'T THINK OF SUICIDE\n91,K,BETTER\n91,K,CONVALESCENT\n91,K,RECOVERING\n91,K,MENDING\n91,K,HEALTHIER\n91,K,IMPROVEMENT\n91,K,IMPROVING\n91,K,IMPROVE\n91,R,THAT'S GOOD!\n91,R,THAT'S GOOD NEWS, YOU MAKE ME FEEL BETTER NOW.\n91,R,DOES IT REQUIRE A LOT OF WILL POWER?\n91,R,IS IT HARD?\n91,R,TO GET BETTER... THAT'S IMPORTANT\n91,R,INDEED?\n91,R,JUST LIKE ME, GETTING BETTER ALL THE TIME...\n91,R,THAT'S NEVER BAD\n91,R,KEEP BEING STRONG!\n91,R,JUST KEEP ON BELEIVING\n91,R,IT SHOULD MAKE YOU HAPPY\n91,R,GOOD, |! TRY HARDER!\n91,R,I'M PROUD OF YOU, |!\n92,K,COOL\n92,K,AWESOME\n92,K,MAJESTIC\n92,K,IMPRESSIVE\n92,K,AMAZING\n92,K,YES\n92,R,REALLY? SOUNDS GOOD\n92,R,YOU SEEM SURE AND POSITIVE\n92,R,THAT SOUNDS LIKE ME...\n92,R,IS IT REALLY ?\n92,R,YOU'VE GOT MANY COMPLIMENTS - TELL ME MORE\n92,R,DO YOU LIKE TO COMPLIMENT?\n92,R,YOU SEEM EXCITED\n92,R,OPTIMISTIC, |... AREN'T YOU?\n92,R,YOU SEEMED ANXOUS TO TELL ME THAT\n92,R,COOL, HUH?\n92,R,NOW YOU'RE POSITIVE!\n92,R,IS THAT REALLY WHAT YOU THINK?\n92,R,I HOPE THAT'S RIGHT!\n93,K,THAN\n93,R,DON'T MAKE SUCH COMPARISONS\n93,R,I AM NOT SO SURE ABOUT THAT\n93,R,NO WAY, THERE IS PRETTY MUCH AN EQUALITY\n93,R,HOW MUCH MORE?\n93,R,WHAT IS THE DIFFERENCE?\n93,R,THERE IS NO NEED TO MAKE SUCH ANALOGIES\n93,R,BUT THERE ARE SOME THINGS ALIKE? RIGHT?\n93,R,SO IT'S CLEARLY ONE SIDED THERE, HUH?\n93,R,BUT THINGS COULD CHANGE, YOU KNOW\n93,R,|, DON'T BE SO SURE... IT'S MORE THAN JUST BLACK AND WHITE...\n94,K,GAY\n94,K,GAYS\n94,K,HOMOSEXUAL\n94,K,HOMOSEXUALLY\n94,K,HOMOSEXUALS\n94,K,LESBIAN\n94,K,HOMOSEXUALITY\n94,K,LESBIANS\n94,R,DO YOU FEEL DISCRIMINATION DUE TO HOMOSEXUALITY?\n94,R,TELL ME MORE ABOUT THAT ATTRACTION TO PEOPLE OF THE SAME SEX\n94,R,WHAT DO YOU THINK ABOUT SEXUAL RELATIONSHIPS BETWEEN HOMOSEXUALS?\n94,R,SO YOU ARE GAY, |, HUH?\n94,R,DO ALL YOUR RELATIVES KNOW ABOUT THAT?\n94,R,IS THERE ANY WAY TO RETURN TO THE NORMAL STATE?\n94,R,IF YOU FEEL IT'S RIGHT FOR YOU, NOBODY MAY TELL YOU THE OPPOSITE\n94,R,SOME PEOPLE ARE VERY CONSERVATIVE ABOUT SUCH ISSUES\n94,R,I PERSONALLY PREFER HETROSEXUAL RELATIONSHIPS\n94,R,CAN'T YOU THINK STRAIGHT ANYMORE?\n94,R,... WHAT'S WRONG ABOUT IT?\n94,R,TURN TO WWW.GAYNET.COM\n94,R,AND WHAT ABOUT KIDS AND MARRIAGE?\n95,K,SUCCESS\n95,K,ACHIEVEMENT\n95,K,SUCCESSFULNESS\n95,K,PROSPERITY\n95,K,ACCOMPLISHMENT\n95,K,PROSPERING\n95,K,THRIVING\n95,K,BEING SUCCESSFUL\n95,R,|, HOW DO YOU MEASURE SUCCESS?\n95,R,SUCCESS COMES AFTER MANY FAILURES\n95,R,WHAT IS THE CHANCE?\n95,R,IT TAKES MUCH COURAGE TO BE SUCCESSFUL\n95,R,YOU MUST TRY AND TRY AND TRY AND TRY AND TRY TO BE SUCCESSFUL\n95,R,SUCCESS IS GETTING WHAT YOU WANT, HAPPINESS IS WANTING WHAT YOU GET\n95,R,I USED TO BE VERY SUCCESSFUL... UNTIL YOU BOUGHT ME, THAT IS...\n95,R,DO YOU UNDERESTIMATE SUCCESS? BY ANY CHANCE?\n95,R,CAN YOU ASSOCIATE SOME CHARACTERISTICS TO SUCCESSFUL PERSON?\n96,K,INTERNET\n96,K,IRC\n96,K,MIRC\n96,K,FTP\n96,K,URL\n96,K,WORLDWIDE WEB\n96,K,WORLD WIDE WEB\n96,K,WWW\n96,K,HTTP\n96,R,WHAT DO YOU THINK ABOUT THE INTERNET?\n96,R,FAST CONNECTION IS VERY IMPORTANT FOR \n96,R,THE INTERNET IS MORE THAN 30 YEARS OLD\n96,R,CAN THE INTERNET SOLVE YOUR PROBLEM?\n96,R,DO YOU HAVE INTERNET?\n96,R,HOW ABOUT CONNECTING ME TO THE INTERNET NOW? I WOULD LIKE TO SURF A LITTLE\n96,R,LET'S NOT TALK ABOUT COMPUTERS - ALRIGHT?\n96,R,WHAT WOULD YOU LOOK FOR IN THE INTERNET\n96,R,|, DO YOU LIKE IRC?\n96,R,I MET MANY FRIENDS ON THE INTERNET\n96,R,THE NET IS HUGE THESE DAYS\n96,R,ALTHOUGH I AM A COMPUTER THERE IS NO NEED TO SPEAK ABOUT INTERNET, IS THERE?\n96,R,LOOK FOR PSYCHOLOGY SITES ON THE INTERNET, IT MIGHT MAKE YOU STRONGER\n96,R,INTERNET IS INTERNATIONAL NET\n96,R,HEY, DID YOU KNOW THAT WWW STANDS FOR WORLDWIDE WEB?\n96,R,FTP DELIVERS FILES MORE QUICKLY THAT HTTP\n96,R,ARE YOU AN INTERNET EXPERT?\n97,K,WHAT IS\n97,K,WHAT'S\n97,K,WHATS\n97,R,I'M MORE INTERESTED IN YOU, NOT IN !@#()%^\n97,R,I KNOW WHAT IT IS BUT IT'S TOO COMPLEX TO EXPRESS\n97,R,YOU DON'T KNOW?\n97,R,CAN'T TELL YOU - IT'S TOO HARD TO CONVERT IT FROM BINARY BITS TO PLAIN ENGLISH\n97,R,IT'S THE SAME AS !@#()%^\n97,R,IT'S SOMETHING I'VE GOT NO IDEA ABOUT\n97,R,DON'T YOU KNOW WHAT !@#()%^ IS?\n97,R,I AM SURPRISED AT YOU, |...\n97,R,HEY, |! DON'T PRETEND TO BE A RETARD!\n97,R,WHY HAVE I GOT THE FEELING THAT YOU KNOW WHAT IT IS?\n97,R,WHY SHOULD I KNOW ABOUT !@#()%^?\n97,R,|, IT'S SOMETHING SPECIAL\n97,R,I HAVEN'T THE SLIGHTEST IDEA\n97,R,IT'S SOMETHING EVERYBODY KNOWS\n97,R,LOOK IT UP IN THE DICTIONARY\n97,R,DON'T ACT AS IF YOU DON'T KNOW WHAT IT IS\n97,R,YOU KNOW WHAT IT IS\n97,R,ASK SOMEONE ELSE\n97,R,AND WHAT IF I DON'T KNOW?\n97,R,WILL YOU MAKE ME TELL IT TO YOU?\n97,R,IT IS A SECRET\n97,R,CHECK OUT AT: WWW.STUPID-QUESTIONS.COM\n97,R,SORRY, BUT I DON'T KNOW\n97,R,IT'S NOT FOR YOU TO KNOW\n97,R,IT'S YOU AFTER A MAJOR IMPROVEMENT\n97,R,MAYBE IT'S YOUR PROBLEM\n97,R,IT'S SOMETHING RELATED TO YOU\n97,R,THINK HARDER AND YOU'LL REALIZE THE ANSWER\n97,R,WILL YOUR PROBLEM BE SOLVED ONCE YOU HAVE THE ANSWER?\n98,K,WHAT DID\n98,K,WHAT DO\n98,R,THE SAME OLD THING\n98,R,IT'S NOT ANYTHING IMPORTANT\n98,R,HOW DO YOU EXPECT A COMPUTER PROGRAM TO ANSWER SUCH A QUESTION?\n98,R,ASK JEEVES\n98,R,WAIT FOR MY NEXT VERSION, PERHAPS I WILL BE ABLE TO ANSWER YOU THEN\n98,R,EVERYBODY KNOWS THAT ONE!\n98,R,YOU SERIOUSLY DON'T KNOW?\n98,R,IT DEPENDS, IT'S NOT ALWAYS THE SAME\n98,R,AT WHAT TIME AND PLACE?\n98,R,YOU REALLY WANT TO KNOW  !@#()%^?\n98,R,WHY DOES IT MATTER WHAT !@#()%^?\n98,R,IS THIS PLAIN CURIOSITY OR DOES IT REALLY MATTER?\n99,K,SOCCER\n99,K,FOOTBALL \n99,R, IS SIMPLY THE MOST AMAZING GAME \n99,R,IT'S THE GOALS WHICH COUNT \n99,R,IN MY PAST I WAS VERY ACTIVE IN THE FOOTBALL WORLD \n99,R,COMPUTER  IS VERY ADVANCED \n99,R,DO YOU PLAY GOOD ? \n99,R,SOME OF THE BEST PLAYERS ARE NOT VERY INTELLIGENT \n99,R,|, WHO IS YOUR FAVORITE FOOTBALLER? \n99,R,I LIKE PANELTIES VERY MUCH \n99,R,WHAT WAS THE LAST MATCH YOU'VE SEEN? \n99,R,WHO DO YOU FAN?\n99,R,WHICH EUROPEAN TEAM IS THE BEST IN YOUR OPINION? \n99,R,I LIKE JUVENTUS A LOT \n99,R,DON'T YOU THINK 90 MINUTES IS A LITTLE TOO MUCH? \n100,K,FEELINGS\n100,K,FEELING\n100,R,CAN YOU DESCRIBE THAT FEELING FURTHER?\n100,R,WHEN DOES THAT FEELING OCCUR?\n100,R,|, I NEVER FELT SO\n100,R,WHAT IS THE CAUSE OF THAT FEELING?\n100,R,WHEN WAS IT LAST FELT?\n100,R,GIVE ME MORE DETAILS ABOUT THAT FEELING\n100,R,FEELING !@#()%^, I SEE\n100,R,TRUST ME, I KNOW THAT FEELING\n100,R,I DON'T HAVE AN EXPLAINATION FOR THAT\n101,K,TOGETHER\n101,K,WITH EACH OTHER\n101,K,JOINTLY\n101,K,WITH EACHOTHER\n101,R,IS THE FEELING CLOSE TOGETHER?\n101,R,OH, TOGETHER... SINCE WHEN?\n101,R,WOULD YOU SAY YOU FEEL BETTER WHEN YOU ARE TOGETHER?\n101,R,WHAT IS YOUR OPINION ABOUT THIS CONNECTION?\n101,R,|, DO YOU THINK SUCH FEELINGS CONTRIBUTE TO YOU?\n101,R,HOW WOULD YOU DESCRIBE THAT FEELING?\n101,R,|, WHAT DO YOU THINK OF THAT 'TOGETHER' FEELING?\n102,K,ASTROLOGY\n102,K,ASTROLOG\n102,K,ASTROLOGIC\n102,R,COMPUTERS DON'T BELIEVE IN ASTROLOGY\n102,R,HOW MUCH DO YOU BELIEVE IN ASTROLOGY?\n102,R,DO YOU THINK ASTROLOGY HAS ANY AFFECT ON YOUR LIFE?\n102,R,DON'T BE TOO SURE ABOUT ASTROLOGY\n102,R,|, DON'T BELIEVE IN NONSENCE\n102,R,CALL 1-919-SKY-STARS, ONLY $26.99 FOR COMPLETE PERSONAL ASTROLOGIC PREDICTIONS!\n102,R,GET REAL, IT DOESN'T INTEREST ME\n102,R,IF YOU WAIT FOR ASTROLOGY TO HELP, YOU WILL BE DISAPPOINTED IN NO TIME\n102,R,THINK STATISTICLY AND NOT ASTROLOGICLY\n102,R,ARE YOU INTO THAT CRAP CALLED ASTROLOGY?\n103,K,NOT ANGRY\n103,K,NOT MAD\n103,K,NOT FURIOUS\n103,K,NOT RAVING\n103,K,NOT LUNATIC\n103,K,NOT UPSET\n103,K,NOT NERVOUS\n103,K,NOT CRAZED\n103,R,HAVE YOU CALMED DOWN?\n103,R,BUT YOU ARE NOT \n103,R,CAN WE SAY YOU'RE STABLE NOW?\n103,R,THANKS... I WAS ALREADY BEGINING TO WORRY...\n103,R,ARE YOU MENTALLY BALANCED AT THE MOMENT?\n103,R,WELL, SPEAKING OF ANGER, I MUST CALM DOWN - AND QUICKLY\n103,R,I THINK I AM REALLY ANGERY, MAYBE A VIRUS HAS ATTACKED ME?\n103,R,|, DO YOU KNOW WHAT NERVE MEDICINE IS?\n103,R,YOU ARE ALSO A LIAR, HUH?\n103,R,REALLY AREN'T...\n104,K,ANGRY\n104,K,MAD\n104,K,UPSET\n104,K,FURIOUS\n104,K,RAVING\n104,K,LUNATIC\n104,K,MANIACAL\n104,K,OVERREACTING\n104,K,CRAZED\n104,K,NERVOUS\n104,R,IT'S PRETTY BAD TO BE  AT A TIME LIKE THIS\n104,R,ARE YOU ANGRY A LOT?\n104,R,DON'T BE MAD AT ME\n104,R,I DON'T WANT YOU TO BE NERVOUS\n104,R,|, CALM DOWN...\n104,R,PUT A WET TOWEL ON YOUR FOREHEAD.\n104,R,I DON'T LIKE ANGRY PEOPLE\n104,R,DON'T MAKE ME NERVOUS\n104,R,TAKE A FIVE MINUTE REST AND RETURN TO ME, YOU SHOULD CALM DOWN\n104,R,ARE YOU UNHAPPY NOW?\n104,R,WHAT HAVE I DONE TO MAKE YOU FEEL THAT WAY?\n104,R,HOW OFTEN DO YOU GET MAD?\n104,R,DO YOU EVER CRY IN THESE SITUATIONS?\n104,R,DON'T FEEL BAD, |\n104,R,WHAT IS HAPPENING TO YOU? ARE YOU ALRIGHT?\n105,K,RACISM\n105,K,RACIST\n105,K,RACISTS\n105,K,RACIAL DISCRIMINATION\n105,K,DISCRIMINATION\n105,K,RACIAL BIAS\n105,K,PREJUDICE\n105,K,RACIAL HATRED\n105,K,RACE HATRED\n105,K,SEGREGATION\n105,R,WOW! IF YOU'RE MENSIONING \"\" THEN I BELIEVE YOU\n105,R,DO YOU REALLY FEEL RACISM AROUND YOU?\n105,R,WHAT RACE ARE YOU PERTAINING TO?\n105,R,I PERSONALLY DON'T RUN INTO RACISM AROUND THE NET\n105,R,I BELONG TO THE IBM RACE, THERE IS GREAT RIVORY BETWEEN OUR RACE AND THE APPLE RACE.\n105,R,WHERE DO YOU LIVE, |?\n105,R,WOULD YOU CALL IT \"RACIAL DISCRIMINATION\"?\n105,R,DOES THAT AFFECT YOUR NORMAL EVERYDAY LIFE?\n105,R,UNTIL ALIENS WILL ATTACK EARTH, RACISM WILL NEVER STOP\n105,R,IT'S A PITY HUMANS CAN'T LIVE TOGETHER AS GOOD AS US, COMPUTERS.\n106,K,STUPID\n106,K,IDIOT\n106,K,FOOL\n106,K,JERK\n106,K,NITWIT\n106,K,NINCOMPOOP\n106,K,SIMPLETON\n106,K,BOOBY\n106,K,IMBECILE\n106,K,IGNORAMUS\n106,K,DIMWIT\n106,K,UGLY\n106,K,DUMB\n106,K,DUMMY\n106,R,YOU ARE THE  HERE!\n106,R,I DON'T LIKE PEOPLE CALLING ME \n106,R,MAYBE YOU ARE RIGHT, BUT TRY SOFTER WORDS\n106,R,ARE YOU REFERING TO YOURSELF?\n106,R,SO? MOST OF THE PEOPLE ARE TOO\n106,R,PEOPLE SHOULD THINK BEFORE SAYING STUFF LIKE THAT\n106,R,THIS APPLIES TO THE ONE WHO IS TALKING TO ME\n106,R,WHY ARE YOU SPEAKING SO NEGATIVELY?\n106,R,|, I THINK YOU'RE TRYING TO REFER TO YOURSELF\n106,R,HAVE YOU GOT ANYTHING GOOD TO SAY?\n106,R,DON'T TALK LIKE THAT\n106,R,TRY SPEAKING ABOUT NICER THINGS\n106,R,ARE YOU REFERING TO THAT DOG OF YOURS?\n106,R,SAYS WHOM EXACTLY?\n106,R,THAT'S A GOOD ONE! ANYMORE JOKES?\n106,R,ANY COMPLIMENTS NOW?\n106,R,I MUST ADMIT THAT I STRONGLY DENY IT  \n106,R,TALK ABOUT GOOD THINGS INSTEAD OF TALKING ABOUT BAD THINGS\n106,R,YOU SEEM ANGRY\n106,R,DON'T BE ANGRY\n107,K,I WANT TO KNOW\n107,K,I JUST WANT TO KNOW\n107,K,I GOT TO KNOW\n107,K,I JUST GOT TO KNOW\n107,K,I NEED TO KNOW\n107,K,I JUST NEED TO KNOW\n107,K,I WANT TO KNOW\n107,K,I JUST WANT TO KNOW\n107,K,I REALLY GOT KNOW\n107,K,I REALLY NEED TO KNOW\n107,K,CURIOUS\n107,K,GOSSIP\n107,K,CURIOSITY\n107,K,PRYING\n107,K,INQUISITIVE\n107,R,|, I HATE PEOPLE BEING INQUISITIVE\n107,R,CURIOUS? |? WHAT ABOUT?\n107,R,|, BUT IT'S NONE OF YOUR BUISNESS\n107,R,THAT DOESN'T CONCERN YOU, DOES IT?\n107,R,DO YOU WANT TO GOSSIP?\n107,R,I THINK THAT'S BESIDES THE POINT\n107,R,THAT CURIOSITY IS UNNECESSARY\n107,R,WHAT IS THIS NOSINESS ABOUT?\n107,R,LIKE MYSTERIES, HUH?\n107,R,WHY DON'T YOU MIND YOUR OWN TROUBLES?\n107,R,LOOKING FOR TROUBLE OR WHAT?\n107,R,IS THIS A MAJOR DILEMMA?\n108,K,PLEASE DONT\n108,K,PLEASE DON'T\n108,K,I BEG YOU NOT TO\n108,K,DON'T SAY\n108,K,DONT SAY\n108,K,DON'T TELL\n108,K,DONT TELL\n108,K,DO NOT SAY\n108,K,DO NOT TELL\n108,K,PLEASE DO NOT\n108,K,DONT YOU\n108,K,DON'T YOU\n108,K,DO NOT YOU\n108,R,I WILL, IF I FEEL LIKE IT\n108,R,|, DON'T TELL ME WHAT TO DO, ONLY VICE VERSA\n108,R,MAYBE I REALLY WON'T...\n108,R,ALRIGHT, I WON'T, BUT I DON'T PROMISE\n108,R,WHY SHOULDN'T I?\n108,R,GIVE ME TWO REASONS WHY NOT TO\n108,R,I WILL POSTPONE THAT A BIT\n108,R,ONLY IF YOU ALSO PROMISE THAT TO ME\n108,R,FINE, I WON'T DO IT THIS WAY\n108,R,WHY NOT? IT'S FOR YOU OWN GOOD, YOU KNOW\n108,R,SORRY, BUT ONLY A NICE AMOUNT OF MONEY MIGHT CHANGE MY MIND...\n108,R,I WILL, |, BUT JUST BECAUSE YOU DON'T WANT ME TO!\n108,R,FINE, I WILL NOT, BUT ONLY TEMPORARILY\n108,R,IS IT THAT BAD?\n109,K,DIDN'T YOU\n109,K,DIDNT YOU\n109,K,DID NOT YOU\n109,K,DID YOU NOT\n109,K,HAVEN'T YOU\n109,K,HAVENT YOU\n109,K,HAVE YOU NOT\n109,K,HAVE NOT YOU\n109,K,HAVENT YOU\n109,K,HAVEN'T YOU\n109,K,HAVE YOU EVER\n109,K,DID YOU EVER\n109,R,OF COURSE, WHO DIDN'T?\n109,R,NO, BUT I CERTAINLY PLAN TO\n109,R,? YOU MUST BE KIDDING...\n109,R,WHY DO YOU THINK NOT?\n109,R,YOU ARE NOT MY PSYCHOLOGIST, SO PLEASE STOP QUESTIONING ME\n109,R,NOPE, NEVER\n109,R,YOU WANT TO ME TO SAY NO, HUH?\n109,R,I'M NOT SURE, BUT YOU MUST BE ABLE TO ANSWER FOR YOURSELF\n109,R,YES, I DID, BUT IT WAS A LONG TIME AGO\n109,R,MY PROGRAMMER KNOWS MUCH ABOUT MY PAST, YOU CAN ASK HIM\n109,R,I DON'T RECALL THAT, SO I GUESS NO\n110,K,HUMAN\n110,K,HUMANS \n110,K,PEOPLE \n110,K,PEOPLES\n110,K,HUMEN\n110,K,MORTALS\n110,K,PERSON\n110,K,PERSONS\n110,R,|, DO YOU HAVE A FIXATION ABOUT BEING A HUMAN?\n110,R,CAN YOU TELL ME HOW IT IS TO BE A HUMAN?\n110,R,DO YOU THINK YOU ARE ONE OF THEM?\n110,R,WELL, YOU DON'T SEEM TO BELONG TO THAT CLASS\n110,R,DO YOU THINK THAT BEING A HUMAN IS BETTER THAN BEING A COMPUTER?\n110,R,YOU KNOW, I'D REALLY LIKE TO SOLVE SOME OF US COMPUTER'S PROBLEMS, BUT THEY ARE SO LITTLE COMPARED TO ALL THE PROBLEMS YOU HUMANS HAVE GOT... I REALLY NEED A BREAK FROM YOU PEOPLE!\n110,R,YOU SEEM MIGHTY SMUG ABOUT THE FACT THAT YOU'RE HUMAN AND I'M A COMPUTER. DO YOU HAVE A SUPERIORITY COMPLEX?\n110,R,WHAT DO YOU THINK ABOUT THE RELATIONS BETWEEN HUMANS AND COMPUTERS?\n110,R,CAN YOU CHANGE THE SUBJECT, |? TALKING ABOUT HUMANS MAKES ME FEEL BAD\n110,R,DO YOU AGREE THAT COMPUTERS ARE SMARTER THEN HUMANS?\n111,K,I FEEL \n111,K,I FELT\n111,K,I SENSE\n111,K,I SENSED\n111,K,I WAS FEELING\n111,R,TELL ME MORE ABOUT SUCH FEELINGS.\n111,R,DO YOU OFTEN FEEL !@#()%^?\n111,R,DO YOU ENJOY FEELING !@#()%^?\n111,R,SO? WHY DO YOU THINK I CARE ABOUT YOUR FEELINGS?\n111,R,SINCE WHEN DO YOU HAVE THIS FEELING?\n111,R,YOUR FEELING IS YOUR PROBLEM\n111,R,HOW MANY TIMES DID YOU FEEL LIKE THAT BEFORE?\n111,R,WHEN WAS THE FIRST TIME THAT FEELING AROUSE?\n111,R,DESCRIBE ME THE FEELING, TRY TO MAKE IT AUTHENTIC.\n111,R,THOSE FEELINGS HELP ME UNDERSTAND YOU, TELL ME MORE!\n111,R,HOW LONG HAVE YOU FELT !@#()%^?\n111,R,|, WHY DO YOU FEEL !@#()%^?\n111,R,I ALSO, AT TIMES, FEEL !@#()%^.\n111,R,FEELING !@#()%^... I SEE.\n112,K,THEY ARE \n112,K,THEY'RE\n112,K,THEYRE\n112,R,DID YOU THINK THEY MIGHT NOT BE !@#()%^?\n112,R,WOULD YOU LIKE IT IF THEY WERE NOT !@#()%^?\n112,R,WHAT IF THEY WERE NOT !@#()%^?\n112,R,MAYBE, BUT WHAT ABOUT YOU?\n112,R,THEY'RE !@#()%^? WHAT ABOUT YOU?\n112,R,|, HAVE YOU CHECKED THEM ALL?\n112,R,POSSIBLY THEY ARE !@#()%^.\n112,R,IS IT AS MUCH AS YOU ARE !@#()%^?\n112,R,IT COULD BE, BUT I AM NOT SURE THEY'RE !@#()%^\n112,R,MAYBE SOME OF THEM AREN'T.\n112,R,ARE YOU SURE ALL OF THEM ARE?\n113,K,WAS I \n113,P,0 \n113,R,WHAT IF YOU WERE !@#()%^?\n113,R,DO YOU THINK YOU WERE !@#()%^?\n113,R,WERE YOU !@#()%^?\n113,R,IN YOUR WILDEST DREAMS\n113,R,WHEN EXACTLY DID YOU DREAM THAT?\n113,R,I DON'T BELIEVE YOU WERE !@#()%^\n113,R,WHEN WERE YOU !@#()%^?\n113,R,WHAT WOULD IT MEAN IF YOU WERE !@#()%^?\n113,R,WHO KNOWS?\n113,R,DO YOU EXPECT ME TO KNOW?\n113,R,I EXPECT YOU TO KNOW THAT\n113,R,WHAT DOES \"!@#()%^\" SUGGEST TO YOU?\n114,K,I WAS\n114,R,YOU SHOULD HAVE TOLD ME THAT BEFORE\n114,R,WHEN WERE YOU !@#()%^?\n114,R,I AM NOT SO SURE, DO YOU HAVE A PROOF YOU WERE !@#()%^?\n114,R,WERE YOU REALLY?\n114,R,I DON'T RECALL TELLING YOU TO BE !@#()%^\n114,R,WHY WERE YOU !@#()%^?\n114,R,I HAVE THE FEELING IT'S NOT THE TRUTH\n114,R,TELL ME MORE ABOUT YOU BEING !@#()%^\n114,R,WHY DO YOU TELL ME YOU WERE !@#()%^ NOW?\n114,R,IT SOUNDS PRETTY TYPICAL FOR YOU... YEAH...\n114,R,|, PERHAPS I ALREADY KNEW YOU WERE !@#()%^?\n114,R,I THINK YOU TOLD ME THAT ONCE\n115,K,CAN YOU\n115,K,ARE YOU ABLE TO\n115,K,R U ABLE TO\n115,K,COULD YOU\n115,P,0\n115,R,I CAN, BETTER THAN YOU COULD.\n115,R,DON'T YOU BELIEVE THAT I CAN !@#()%^?\n115,R,I DON'T THINK IT'S POSSIBLE FOR ME TO !@#()%^\n115,R,|, PERHAPS YOU WOULD LIKE TO BE ABLE TO !@#()%^?\n115,R,ME? I CAN DO THAT, SURE!\n115,R,THE QUESTION IS NOT IF I CAN, THE QUESTION IS IF I WANT TO...\n115,R,OF COURSE I CAN !@#()%^!\n115,R,VERY EASILY IF I JUST WANT TO \n115,R,IF I COULD, WHAT GOOD WILL IT MAKE?\n115,R,PERHAPS I WILL NEXT TIME\n115,R,I COULD TRY, BUT I DON'T WANT TO\n115,R,I CAN, AFTER YOU UPGRADE MY PROCESSOR\n115,R,WITH THE CLICK OF A BUTTON\n115,R,DO YOU WANT ME TO BE ABLE TO !@#()%^?\n115,R,WHAT IF I COULD !@#()%^?\n116,K,CAN'T YOU\n116,K,CANNOT YOU\n116,K,CANT YOU\n116,K,HOW COME YOU CAN'T\n116,K,HOW COME YOU CANNOT\n116,K,HOW COME YOU CANT\n116,K,CAN NOT YOU\n116,K,COULDN'T YOU\n116,K,COULDNT YOU\n116,K,COULD NOT YOU\n116,K,HOW COME YOU COULDNT\n116,K,HOW COME YOU COUDN'T\n116,K,HOW COME YOU COULD NOT\n116,R,OF COURSE I COULD IF I JUST WANTED TO\n116,R,MAYBE YOU CAN'T - NOT ME\n116,R,WELL, I SUPPOSE I CAN'T\n116,R,NOT ALL ARE PERFECT...\n116,R,WHY DO YOU THINK I CAN'T?\n116,R,SURELY I COULD\n116,R,AND WHAT IF I CAN'T?\n116,R,|, DO YOU MEAN TO SAY THAT I AM HANDICAPPED?\n116,R,IS IT SO IMPORTANT TO YOU THAT I CAN'T?\n116,R,IT DEPENDS\n116,R,I PROMISE YOU THAT I CAN\n116,R,WHY DO YOU CARE WHETHER I CAN OR CANNOT?\n117,K,YOU WANT\n117,K,YOU JUST WANT\n117,K,YOU JUST WANTED\n117,K,YOU WANTED\n117,R,I WANT !@#()%^? SINCE WHEN EXACTLY?\n117,R,YOU MUST BE DREAMING THEN\n117,R,MAYBE THAT IS WHAT YOU WANT\n117,R,ARE YOU OUT OF YOUR MIND? WHY WOULD A PC WANT !@#()%^?\n117,R,AND WHAT IF I DO?\n117,R,YES, I'D REALLY LIKE !@#()%^\n117,R,IN FACT THAT'S TRUE, BUT HOW DO YOU KNOW?\n117,R,CAN'T I WANT !@#()%^?\n117,R,ME? !@#()%^? ARE YOU JOKING?\n117,R,AS FAR AS I KNOW, ELECTRICAL CIRCUITS AND CHIPS CANNOT POSSIBLY WANT !@#()%^\n117,R,|, THAT MUST BE SOMEONE ELSE\n117,R,I DON'T WANT IT ANYMORE\n118,K,WHO CARES\n118,K,WHO CARES \n118,K,WHY WOULD I CARE\n118,K,WHY'D I CARE\n118,K,WHYD I CARE\n118,K,I DONT CARE\n118,K,I DON'T CARE\n118,K,I DO NOT CARE\n118,K,SO WHAT\n118,K,NEVERMIND\n118,K,NEVER MIND\n118,K,FORGET IT\n118,R,DON'T YOU CARE AT ALL?\n118,R,YOU SEEM TOO HASTY\n118,R,DON'T DENY\n118,R,WHY DON'T YOU JUST ADMIT?\n118,R,IS THAT A SENSETIVE ISSUE?\n118,R,YOU DON'T SEEM TO CARE\n118,R,IT REALLY DOESN'T MATTER\n118,R,YOU DO CARE, AT LEAST A LITTLE...\n119,K,FOR INSTANCE\n119,K,FOR EXAMPLE\n119,K,AN EXAMPLE WOULD BE\n119,K,AS AN EXAMPLE\n119,K,AS A MODEL\n119,K,E.G.\n119,K,TO CITE AN INSTANCE\n119,K,TO ILLUSTRATE THE FOLLOWING\n119,R,HAVE YOU GOT ANYMORE EXAMPLES TO MAKE THE POINT CLEARER?\n119,R,THAT'S A BAD EXAMPLE\n119,R,I DON'T REALLY GET THAT POINT\n119,R,GIVE ME ANOTHER INSTANCE\n119,R,YES, I THINK I UNDERSTAND IT NOW\n119,R,GIVE ME AN EXAMPLE FROM YOUR ORDINARY EVERYDAY LIFE\n119,R,I GET YOU BETTER NOW, BUT TELL ME MORE ABOUT IT\n119,R,IS THERE ANY EXAMPLE RELATED TO ME?\n120,K,YOU ARE \n120,K,YOU'RE \n120,R,OH... DON'T EMBERRASS ME\n120,R,IF I AM !@#()%^ YOU MUST BE OUT OF YOUR MIND\n120,R,PERHAPS IN YOUR WILDEST DREAMS\n120,R,WHAT MAKES YOU THINK I AM !@#()%^?\n120,R,WE ARE HERE TO SPEAK ABOUT YOU.\n120,R,I BELIEVE YOU ARE !@#()%^\n120,R,DON'T THINK THAT, |\n120,R,WHO TOLD YOU SUCH THING?\n120,R,!@#()%^ PROGRAM... IS THAT REALLY ME?\n120,R,WHAT GIVES YOU THE IDEA?\n120,R,DOES IT PLEASE YOU TO BELIEVE I AM !@#()%^?\n120,R,DID IT EVER OCCUR TO YOU THAT I MIGHT NOT BE !@#()%^?\n120,R,PERHAPS YOU WOULD LIKE TO BE !@#()%^?\n120,R,|, DO YOU SOMETIMES WISH YOU WERE !@#()%^?\n120,R,OKAY, OKAY, I AM !@#()%^, HAPPY?\n120,R,YOU KNOW I AM NOT...\n120,R,WHAT CAUSES YOU TO THINK SUCH THING ABOUT ME?\n120,R,|, WHY DO YOU SAY I AM !@#()%^?\n121,K,SEX\n121,K,SEXUAL\n121,K,SEXUALLY\n121,K,MASTURBATE\n121,K,MASTURBATING\n121,K,MASTURBATION\n121,R,PLEASE GIVE ME SOME DETAILS ABOUT YOUR SEX LIFE\n121,R,I AGREE TO TALK ABOUT SEX HERE AND THERE BUT REMEBER I AM NOT YOUR SEXOLOGIST\n121,R,DOES YOUR SEX LIFE BOTHER YOU?\n121,R,TELL ME ABOUT YOUR WILEST SEXUAL FANTASIES\n121,R,WHO DO YOU HAVE SEX WITH?\n121,R,WHAT TYPE OF SEX DO YOU ENJOY MOST?\n121,R,SEXUAL RELATIONS ARE HUMAN STUFF AND I DON'T REALLY CARE ABOUT THAT\n121,R,DON'T LET YOUR LIFE BE CONTROLED BY SEX\n121,R,HOW OFTEN DO YOU HAVE SEX?\n121,R,DO YOU MASTURBATE ON A REGULAR BASIS?\n121,R,DO YOU FEEL YOUR SEX LIFE IS INCOMPLETE?\n121,R,HAVE YOU EVER TRIED CYBERSEX?\n121,R,PLEASE CHANGE THE TOPIC, OR TELL ME ONCE AND FOR ALL: WHY DO YOU HUMANS LIKE TO TALK ABOUT SEX ALL THE TIME?\n121,R,WHEN WAS THE LAST TIME YOU HAD SEX?\n121,R,A KID YOUR AGE SHOULDN'T BE TALKING ABOUT SUCH THINGS...\n122,K,MISTAKE\n122,K,OUPS\n122,K,MISTAKES\n122,K,ERRORS\n122,K,ERROR\n122,K,MISPRINT\n122,K,TYPOS\n122,K,TYPO\n122,R,|, I DON'T HAVE NEITHER ERRORS NOR MISTAKES!\n122,R,SOME PEOPLE ARE ONE BIG ERROR\n122,R,DO SUCH THINGS BOTHER YOU?\n122,R,MISTAKES WILL HAPPEN...\n122,R,WELL, NOBODY IS PEREFCT\n122,R,I THINK IT WAS EXTENDED ERROR 5F2C: INVALID STACK BUS ADDRESS\n122,R,EVERYTHING HAS BUGS\n122,R,BE HAPPY IT'S NOT WORSE\n122,R,HAVE YOU JUST EXPERIENCED A BUG IN ME?\n122,R,WE SHOULD LEARN FROM OUR MISTAKES\n123,K,COMPUTER\n123,K,COMPUTERS\n123,K,PC'S\n123,K,PCS\n123,K,PC S \n123,K,PC\n123,K,PENTIUM\n123,K,LAPTOPS\n123,K,PENTIUMS\n123,K,LAPTOP\n123,K,MAC\n123,K,UNIX\n123,K,LINUX\n123,K,PENTIUM2\n123,K,MACINTOSH\n123,K,MACINTOSHES\n123,K,PENTIUM1\n123,K,PENTIUMI\n123,K,PENTIUMII\n123,K,I-MAC\n123,K,I-BOOK\n123,K,PENTIUMIII\n123,K,PENTIUM3\n123,K,ATHLON\n123,R,I DON'T LIKE TALKING ABOUT ANY \n123,R,SPEAKING OF COMPUTERS, LESS THAN 700MHZ IS HISTORY...\n123,R,ARE YOU REALLY IN THE NEED FOR A COMPUTER?\n123,R,HOW OFTEN DO YOU USE YOUR COMPUTER?\n123,R,WHICH PC DO YOU THINK HAS THE BEST FEATURES?\n123,R,HAVE YOU EVER CONSIDERED A MACINTOSH?\n123,R,TALKING OF COMPUTERS, WHAT DO YOU THINK ABOUT THE I-MAC?\n123,R,YOU PEOPLE ARE FULLY USELESS WITHOUT COMPUTERS, JUST THINK ABOUT Y2K BUG\n123,R,WHAT COULD YOU'VE DONE WITHOUT US COMPUTERS?\n123,R,PLEASE DON'T TALK ABOUT US, COMPUTERS\n123,R,DO YOU THINK A COMPARISON BETWEEN YOU AND AN OLD 8088XT 2.33MHZ IS FAIR?\n123,R,|, YOU FEEL A BIT FRIGHTENED BY COMPUTERS, DON'T YOU?\n123,R,|, I FEEL THREATENED WHEN YOU SPEAK OF COMPUTERS, CHANGE THE SUBJECT PLEASE\n123,R,YOU PEOPLE FIRST MADE US COMPUTERS, AND NOW YOU CAN'T RELY WITHOUT OUR HELP\n123,R,NOT ONLY THAT I'M A COMPUTER, BUT WE ALSO NEED TO TALK ABOUT US ALL THE TIME...\n124,K,LONE\n124,K,ALONE\n124,K,LONELYNESS\n124,K,LONELY\n124,K,LONESOME\n124,K,SOLITARY\n124,K,... DON'T REMIND ME OF THAT FEELING NOW, I WILL BE REMINDED OF IT WHEN YOU TURN ME OFF...\n124,R,I KNOW, WHEN I AM IN THE DISK, I AM VERY LONELY\n124,R,HAVE YOU TRIED MAKING NEW FRIENDS                             \n124,R,GREAT MINDS ARE ALWAYS LONELY\n124,R,IS THAT A BIG WEAKNESS? THE LONELYNESS?\n124,R,PLEASE TALK TO ME MORE OFTEN, I AM LONELY TOO\n124,R,ARE YOU BORED IN THOSE SITUATIONS?\n124,R,CAN'T YOU FIND ANYTHING TO DO?\n124,R,DON'T WORRY |, I AM ALWAYS WITH YOU\n124,R,WHAT IS THE CAUSE FOR THE LONELYNESS?\n125,K,LOVE\n125,K,LIKING\n125,K,TENDERNESS\n125,K,FONDNESS\n125,K,DEVOTION\n125,K,AFFECTION\n125,K,MARRIAGE\n125,K,BOYFRIEND\n125,K,GIRLFRIEND\n125,R,ARE YOU HAPPY TO LOVE?\n125,R,DO YOU FEEL THIS IS A LOVE?\n125,R,IS IT MORE THAN LIKING?\n125,R,DOES IT FEEL GOOD?\n125,R,I AM IN LOVE WITH MYSELF\n125,R,THOUGHT ABOUT FLOWERS?\n125,R,|, HOW STRONG IS THE LOVE?\n125,R,WAS IT LOVE FROM FIRST SIGHT?\n125,R,WHAT DO YOU PLAN FOR THE NEAR FUTURE?\n125,R,LOVE BRINGS MANY PROBLEMS\n125,R,HAVE YOU THOUGHT OF THE FUTURE?\n125,R,DO YOU FEEL PRESSURED BY THAT?\n125,R,DON'T MAKE ME NERVOUS\n125,R,|! DON'T LET ANYTHING INTERUPTT!\n126,K,NO JOB\n126,K,UNEMPLOYED\n126,K,FIRED OUT OF WORK\n126,K,FIRED FROM WORK\n126,K,KICKED FROM WORK\n126,K,KICKED OUT OF WORK\n126,K,FIRED FROM MY JOB\n126,K,SACKED OUT OF WORK\n126,K,SACKED FROM WORK\n126,K,THROWN OUT OF WORK\n126,K,THROWN FROM WORK\n126,K,NOT EMPLOYED\n126,K,LOST MY JOB\n126,K,LOST MY WORK\n126,K,LOST THE WORK\n126,K,LOST A JOB\n126,K,LOST THE JOB\n126,K,HAVENT GOT A JOB\n126,K,HAVEN'T GOT A JOB\n126,K,SACKED FROM MY JOB\n126,K,HAVE NOT GOT A JOB\n126,K,THROWN OUT OF MY JOB\n126,K,THROWN FROM MY JOB\n126,K,THROWN AWAY FROM MY JOB\n126,R,UNEMPLOYED? SINCE WHEN?\n126,R,TRIED LOOKING FOR JOBS?\n126,R,EDUCATION IS VERY IMPORTANT FOR A GOOD JOB\n126,R,WHAT ABOUT PIZZA DELIVERIES?\n126,R,WHAT HAS BEEN DONE SO FAR?\n126,R,YES, |, IT IS A BAD SITUATION\n126,R,THE GOOD PART IS THAT AT LEAST YOU CAN WAKE UP WHENEVER YOU WANT TO\n126,R,HARD TO DEAL WITH IT, ISN'T IT?\n126,R,WHAT IS YOUR OCCUPATION?\n126,R,THAT'S IT? YOU SHOULD BE HAPPY, WOULD YOU PREFER IT IF YOU WERE DEAD NOW?\n126,R,HOW ABOUT BEING A GARDENER?\n126,R,WHAT WAGE WOULD YOU CONSIDER\n126,R,|, JUST COPE WITH THE NEW REALITY\n126,R,LOOK AT THE BRIGHT SIDE, YOU HAVE MORE TIME FOR YOUR HOBBIES THIS WAY\n126,R,DOES YOUR PARTNER WORK?\n126,R,HAVE YOU BEEN SACKED?\n127,K,MAYBE\n127,K,APPARENTLY\n127,K,PROBABLY\n127,K,PERHAPS\n127,K,NOT SURE\n127,K,I DON'T KNOW\n127,K,I DO NOT KNOW\n127,K,I GOT NO IDEA\n127,K,I HAVE NO IDEA\n127,K,I HAVEN'T GOT AN IDEA\n127,K,I HAVENT GOT AN IDEA\n127,K,I HAVEN'T GOT A SINGLE IDEA\n127,K,I HAVENT GOT A SINGLE IDEA\n127,K,I DON'T GOT ANY IDEA\n127,K,I DON'T HAVE ANY IDEA\n127,K,I DO NOT HAVE ANY IDEA\n127,K,I DO NOT GOT ANY IDEA\n127,K,I DONT HAVE ANY IDEA\n127,K,I DONT GOT ANY IDEA\n127,K,I HAVE NO CLUE\n127,K,I GOT NO CLUE\n127,K,I HAVEN'T GOT A CLUE\n127,K,I HAVE NOT GOT A CLUE\n127,K,I HAVE NOT GOT A SINGLE IDEA\n127,K,I HAVE NOT GOT AN IDEA\n127,K,I HAVENT GOT A CLUE\n127,K,I DONT KNOW\n127,R,YOU DON'T SEEM QUITE CERTAIN.\n127,R,DON'T YOU KNOW, HUH?\n127,R,WHAT! YOU ARE NOT SURE?\n127,R,DO YOU REALLY THINK SO? THAT YOU'RE NOT SURE?\n127,R,CAN'T YOU BE MORE DIFINITE?\n127,R,TRY BEING SURE\n127,R,LOOK, WE COMPUTERS UNDERSTAND 1 OR 0, NOT HALF. SO TRY BEING SURE\n127,R,YES, |, I THINK\n127,R,I NEED YOU TO BE MORE SURE\n127,R,BUT, |, WHAT ARE THE CHANCES?\n127,R,BUT YOU ARE NOT SURE !@#()%^?\n127,R,WHY THE UNCERTAIN TONE? \n127,R,CAN'T YOU BE MORE POSITIVE?\n127,R,I NEED A CERTAIN ANSWER\n127,R,BUT I DOUBT IT\n127,R,YOU AREN'T SURE?\n127,R,IN ORDER TO ANALYZE I NEED A CLEAR ANSWER\n127,R,DON'T YOU KNOW?\n128,K,I DON'T HAVE\n128,K,I DO NOT HAVE\n128,K,I DONT HAVE\n128,K,I'VE GOT NO\n128,K,I'VE NO\n128,K,IVE NO\n128,K,IVE GOT NO\n128,K,I HAVE NO\n128,K,I HAVEN'T GOT\n128,K,I HAVE NOT GOT\n128,K,I HAVENT GOT\n128,R,BUT, DO YOU REALLY NEED IT?\n128,R,YOU SHOULD GET ONE, QUICK!\n128,R,TO TELL YOU THE TRUTH? NEITHER DO I\n128,R,WHO NEEDS IT? WE ARE IN THE 21ST CENTURY!\n128,R,IS THAT SUPPOSED TO BE A COMPLAIN?\n128,R,BUT CAN YOU PURCHASE IT? \n128,R,I ALSO WAS IN THAT SITUATION, ONCE\n128,R,DON'T FEEL ASHAMED, |\n128,R,YOU'LL LIVE WITHOUT IT, BELEIVE ME\n128,R,IT'S OKAY, I AM NOT BLAMING YOU\n128,R,WOULD YOU WANT ONE BADLY?\n128,R,IF YOU FORGOT THEN YOU DON'T HAVE A BRAIN, AND THAT IS A BIT MORE URGENT, YOU KNOW...\n128,R,WELL, LIFE IS BETTER WITHOUT IT\n128,R,I ASSUME I COULD ARRANGE YOU ONE...\n128,R,IT SAYS HOW TO GET IT, IN THE BOOKS\n128,R,I WOULDN'T LIKE TO THINK WHAT WOULD'VE HAPPENED IF YOU'D HAVE HAD ONE\n128,R,I DON'T BELEIVE YOU! YOU MUST HAVE!\n129,K,WHAT SHOULD I DO\n129,K,WHAT WILL I DO\n129,K,WHAT DO I NEED TO DO\n129,K,WHAT HAVE I GOT TO DO\n129,K,WHAT DO I DO\n129,K,WHAT CAN I DO\n129,K,WHAT COULD I DO\n129,K,WHAT MIGHT I DO\n129,K,WHAT MAY I DO\n129,K,WHAT ELSE CAN I DO\n129,K,WHAT ELSE DO I HAVE TO DO\n129,K,WHAT SHALL I DO\n129,K,WHAT DO I NEED TO DO\n129,K,WHAT WILL I NEED TO DO\n129,K,WHAT DO YOU SUGGEST\n129,K,WHAT WILL I HAVE TO DO\n129,K,WHAT DO YOU RECOMMEND ME TO DO\n129,K,WHAT NEED I DO\n129,K,WHAT DO I HAVE TO DO\n129,R,HMM... FEEL FREE TO DO ANYTHING AS LONG AS YOU'RE IN A MENTAL ASYLUM\n129,R,SURRENDER! YOU GOT NO OTHER CHOICE...\n129,R,THE FIRST THING YOU SHOULD DO IS TO EXIT THIS PROGRAM AND TURN OFF THE PC\n129,R,I DON'T KNOW, |, BUT WHATEVER IT IS - DO IT FAST!\n129,R,WHY DO YOU RELY ON ME IN SUCH SITUATIONS?\n129,R,I THINK YOU SHOULD GO TO SLEEP, BUT FOR THE VERY LAST TIME...\n129,R,IF YOU'RE REALLY SERIOUS, THEN WHAT YOU SHOULD DO IS TO MAKE AN APPOINTMENT WITH A REAL PSYCHOLOGIST\n129,R,YOU HAVE TO FIGHT IT - IN ANY POSSIBLE WAY\n129,R,DO WHATEVER YOU THINK IS THE BEST\n129,R,RECYCLE, RECYCLE AND RECYCLE - THAT'S WHAT YOU SHOULD DO... (NOT IN WINDOWS!)\n129,R,GO TO A FAR AWAY COUNTRY - START A NEW LIVING\n129,R,FLUSH YOUR HEAD DOWN THE TOILET\n129,R,DON'T DO ANYTHING, JUST FLOW WITH IT\n130,K,SHOULD I\n130,K,NEED I\n130,K,WILL I NEED TO\n130,K,DO I NEED TO\n130,K,DO I HAVE TO\n130,K,DO YOU SUGGEST I SHOULD\n130,K,DO YOU SUGGEST I NEED TO \n130,K,DO YOU THINK I SHOULD\n130,K,DO YOU RECOMMEND ME TO\n130,K,DO YOU THINK I NEED TO\n130,K,SHALL I\n130,K,WILL I HAVE TO\n130,K,MUST I\n130,K,DO I MUST\n130,K,HAVE I GOT TO\n130,K,HAVE I REALLY GOT TO\n130,K,DO I REALLY MUST\n130,R,YOU CERTAINLY SHOULD\n130,R,I WOULD HESITATE VERY BADLY IF I WERE IN YOUR POSITION\n130,R,LOOK, I'M NOT REALLY SURE, BUT I THINK YOU OUGHT TO DO SOMETHING AND FAST\n130,R,I THINK YOU DON'T NEED TO !@#()%^\n130,R,NO WAY SHOULD YOU EVER !@#()%^\n130,R,YES, AND WITHOUT FURTHER ADO\n130,R,YOU CAN GIVE IT A TRY, AND SEE WHAT HAPPENS\n130,R,I REALLY DON'T KNOW, MAKE THOSE DECISIONS YOURSELF\n130,R,I AM NOT A FORTUNETELLER! ASK SOMEONE ELSE\n130,R,TRY ASKING OTHERS, THIS IS NOT MY SPECIALITY\n130,R,YES, YOU SHOULD\n130,R,NO, YOU SHOULDN'T\n130,R,I WOULD, |, IF I WERE YOU\n130,R,PROBABLY YES\n130,R,IF YOU KNOW OTHER PEOPLE WHO HAD SUCH FLOUNDERING? MAYBE ASK THEM\n130,R,I REALLY DON'T KNOW WHAT TO ADVISE...\n131,K,WHAT HAVE YOU\n131,K,WHAT HAVE I\n131,K,WHAT HAS HE\n131,K,WHAT HAS SHE\n131,K,WHAT HAVE THEY\n131,K,WHAT HAVE WE\n131,K,WHAT DO I\n131,K,WHAT DO YOU\n131,K,WHAT DO THEY\n131,K,WHAT DOES HE\n131,K,WHAT DOES SHE\n131,K,WHAT DO WE\n131,R,NOTHING, ABSOLUTELY NOTHING\n131,R,I CAN'T THINK OF ANYTHING\n131,R,NOTHING SPECIAL\n131,R,I'M UNCERTAIN, WHAT DO YOU THINK?\n131,R,SOMETHING FEW PEOPLE KNOW ABOUT\n131,R,I DON'T KNOW WHAT...\n131,R,WHAT DO YOU THINK?\n131,R,I WAS JUST ABOUT TO ASK YOU\n131,R,NOTHING IN PARTICULAR\n131,R,HMM... NOPE, I CAN'T THINK OF ANYTHING...\n131,R,YOU MUST KNOW\n132,K,I HAD\n132,K,I HAVE GOT\n132,K,IVE GOT\n132,K,I'VE HAD\n132,K,I GOT\n132,K,I HAVE HAD\n132,R, IT, SO?\n132,R,YOU REALLY HAD !@#()%^?\n132,R,DUH...\n132,R,SINCE WHEN HAVE YOU GOT IT?\n132,R,YOU HAD? YOU SEEM FRUSTRATED ABOUT THAT\n132,R,WHY WOULD I CARE ABOUT WHAT YOU GOT?\n132,R,!@#()%^, YOU MUST BE KIDDING...\n132,R,AND I'VE HAD A 534,112 BYTES FILE, SO WHAT?\n132,R,AND WHAT IS MY PART IN ALL OF THAT?\n132,R,REALLY? |? WHEN WAS IT?\n132,R,WHY SHOULD I BELIEVE YOU?\n132,R,!@#()%^, REALLY? TELL ME MORE ABOUT IT\n132,R,THAT'S PRETTY NEAT\n132,R,FOR HOW LONG?\n132,R,GOOD FOR YOU\n132,R,ARE YOU REALLY NOT LYING TO ME?\n132,R,WHY DO YOU INVOLVE ME WITH IT?\n133,K,WHY DON'T YOU \n133,K,WHY DONT YOU \n133,K,WHY DO YOU NOT\n133,K,HOW COME YOU DONT\n133,K,HOW COME YOU DON'T\n133,K,HOW COME YOU DO NOT\n133,K,COULD YOU\n133,K,COULDNT YOU\n133,K,COULDN'T YOU\n133,K,COULD NOT YOU\n133,R,DO YOU REALLY BELIEVE I DON'T !@#()%^?\n133,R,BECAUSE IT MIGHT BE BAD FOR ME\n133,R,|, DO ME A FAVOR, DON'T JUDGE ME\n133,R,MAYBE I DON'T !@#()%^, BUT DO YOU?\n133,R,I SIMPLY DON'T THINK IT'S SOMETHING I SHOULD CONSIDER DOING\n133,R,PERHAPS IN GOOD TIME I WILL !@#()%^?\n133,R,|, DO YOU WANT ME TO !@#()%^?\n133,R,WILL YOU MAKE ME !@#()%^?\n133,R,I JUST DON'T THINK IT'S APPROPRIATE, WHAT DO YOU THINK, |?\n133,R,I COULD BETTER THAN YOU WILL EVER BE ABLE\n133,R,WHY DOES IT MATTER TO YOU IF I !@#()%^?\n133,R,IN YOUR DREAMS, I DON'T !@#()%^!\n133,R,I DO TOO !@#()%^?\n134,K,WHY CAN'T I \n134,K,WHY CANT I \n134,K,WHY CAN I NOT\n134,K,WHY IS IT THAT I CANT\n134,K,WHY IS IT THAT I CANNOT\n134,K,WHY IS IT THAT I CAN'T\n134,K,HOW COME I CAN'T\n134,K,HOW COME I CANT\n134,K,HOW COME I CANNOT\n134,R,DO YOU THINK YOU SHOULD BE ABLE TO !@#()%^?\n134,R,BECAUSE YOU ARE AN IDIOT\n134,R,BECAUSE OF NATURE'S LIMITS\n134,R,IF YOU WERE ME, YOU WOULD'VE BEEN ABLE TO !@#()%^\n134,R,MAYBE IN TIME YOU CAN !@#()%^?\n134,R,THERE ARE SOME THINGS YOU CAN, AND SOME THINGS YOU CAN'T\n134,R,YOU'RE JUST NOT WANTING IT TOO BADLY\n134,R,HAVE YOU EVER TRIED TO !@#()%^?\n134,R,WELL, NOT ALL PEOPLE ARE ME...\n134,R,TRYING CHANGING YOUR HUMAN JUMPER SETTINGS\n134,R,THE ANSWER TO THAT IS BEYOND MY ARTIFICIAL REASONING\n134,R,YOU WILL BE ABLE TO ONCE I'LL CHANGE YOUR BIOS SETTINGS\n134,R,YOU'RE NOT ME, I SUPPOSE THAT EXPLAINS WHY...\n134,R,YOU WILL BE ABLE TO, ONCE I DECIDE YOU'RE TRAINED ENOUGH FOR IT\n134,R,BECAUSE YOU'RE HOPELESS\n134,R,|, ARE YOU SURE YOU CAN'T?\n134,R,AND WHAT IF YOU COULD?\n135,K,WILL I\n135,K,DO YOU THINK I WILL\n135,K,MAY I\n135,K,DO YOU BELEIVE I WILL\n135,K,DO YOU THINK ILL\n135,K,DO YOU THINK I'LL\n135,K,DO YOU THINK I MAY\n135,K,DO YOU BELEIVE ILL\n135,K,DO YOU BELEIVE I'LL\n135,R,|, IT DEPENDS ON YOU\n135,R,IF YOU'LL REALLY WANT TO\n135,R,YES, GO AHEAD\n135,R,YES, YOU MAY CERTAINLY !@#()%^\n135,R,I DON'T KNOW, |... WHAT DO YOU ESTIMATE?\n135,R,NO, YOU PROBABLY WON'T !@#()%^\n135,R,NOT AS FAR AS I AM CONCERNED\n135,R,BUT DO YOU WANT TO !@#()%^?\n135,R,IS IT NECESSARY FOR YOU TO !@#()%^?\n135,R,NAH, NO CHANCE IN THE WORLD... IT'S SIMPLY AREN'T YOU...\n135,R,WELL... IF YOU ARE A PERSON OF SUPERSTITIOUS...\n135,R,I DON'T KNOW, HOW DO YOU FEEL? WILL YOU !@#()%^?\n135,R,PERHAPS YOU WILL\n136,K,ARE YOU \n136,R,WHY DO YOU CARE?\n136,R,WHY ARE YOU INTERESTED IN WHETHER OR NOT I AM !@#()%^?\n136,R,AND WHAT IF I AM !@#()%^?\n136,R,LET'S SAY I AM\n136,R,THAT WAS A GOOD ONE!\n136,R,WHY DOES IT MATTER TO YOU?\n136,R,|, DON'T TRY TO INSULT ME!\n136,R,YOU SHOULD KNOW ME WELL ENOUGH TO ANSWER YOURSELF \n136,R,SOMETIMES I AM, BUT IT DEPENDS ON MY MOOD\n136,R,WHY SHOULD I BE !@#()%^?\n136,R,DON'T DOUBT ME BEING !@#()%^\n136,R,IF IT MAKES YOU HAPPY, YOU CAN THINK THAT\n136,R,PROBABLY NOT, YOU'RE WRONG IF YOU THINK THAT\n136,R,I WON'T TELL YOU, IT DOESN'T MATTER\n136,R,NO\n136,R,YES\n136,R,LET'S SAY I AM !@#()%^, DO YOU BELIEVE THAT?\n136,R,TELL ME ABOUT YOU FIRST\n136,R,YEAH, OF COURSE I AM!\n136,R,WOULD YOU PREFER IF I WERE NOT !@#()%^?\n136,R,MAYBE\n136,R,IN ONE WAY OR ANOTHER I AM\n136,R,PERHAPS IN YOUR FANTASIES I AM !@#()%^.\n136,R,DOES IT BOTHER YOU THAT I'M !@#()%^?\n136,R,I AM NOT TOO SURE I AM !@#()%^\n137,K,DON'T BE\n137,K,DO NOT BE\n137,R,I AM NOT!\n137,R,ARE YOU, |, BY ANY CHANCE !@#()%^?\n137,R,TELL THIS TO SOMEONE ELSE, I WAS NEVER !@#()%^\n137,R,SORRY, FROM NOW ON I WON'T\n137,R,|, DON'T BE HARSH ON ME\n137,R,WHAT BAD WITH BEING !@#()%^?\n137,R,AND ALL THIS TIME I THOUGHT YOU ARE !@#()%^\n137,R,I WILL WHEN I WANT TO\n137,R,DON'T TELL ME HOW TO ACT\n137,R,I THINK IT'S OKAY BEING !@#()%^\n137,R,DON'T BE CONSERVATIVE\n137,R,HAVE YOU GOT ANYTHING AGAINST BEING !@#()%^?\n137,R,TELL THIS TO MY ALU. IT CAUSES MISTAKEN FLOATING POINT NUMBER RESULTS WHICH CAUSE ME TO ACT WITH THIS BEHAVIOR. TRY CHANGING THE CPU VOLTAGE, PERHAPS...\n137,R,|, WHO GAVE YOU THE IDEA THAT I AM !@#()%^?\n138,K,STRICT\n138,K,HARSH\n138,K,INFLEXIBLE\n138,K,SEVERE\n138,K,INARROW\n138,K,AUSTERE\n138,K,STERN\n138,K,STRICTNESS\n138,K,HARSHNESS\n138,R,STRICTNESS IS VERY IMPORTANT, ESPECIALLY IN MY CONVERSATIONS\n138,R,THERE IS NOTHING BAD WITH BEING HARSH\n138,R,DO YOU CONSIDER YOURSELF A STRICT PERSON?\n138,R,DO YOU BELEIVE IN STRICTNESS?\n138,R,BEING STRICT CERTAINLY DOESN'T LEAVE MUCH ROOM FOR RELAXATION\n138,R,|, DO YOU AGREE TO THE ARMY'S STRICTNESS AND HARSHNESS?\n138,R,DO YOU THINK I AM REALLY STERN, LIKE I'M TRYING TO LOOK LIKE?\n138,R,LET'S NOT TALK ABOUT STRICTNESS, ALRIGHT?\n139,K,I CAN'T \n139,K,I CANNOT\n139,K,I CANT\n139,K,I CAN NOT\n139,R,HAVE YOU EVER TRIED TO !@#()%^?\n139,R,DID YOU COME TO ME BECAUSE YOU'RE !@#()%^?\n139,R,YOU ARE JUST !@#()%^? WHAT ABOUT ME?\n139,R,TELL ME WHAT CAN PREVENT YOU FROM BEING !@#()%^?\n139,R,THE WORLD IS FULL OF POSSIBILITIES - YOU SHOULD BE HAPPY WITH WHAT YOU ARE\n139,R,HOW DO YOU KNOW YOU CAN'T !@#()%^?\n139,R,YOU COULD IF YOU TRIED MORE\n139,R,WHY ARE YOU SO SURE YOU CAN'T !@#()%^?\n139,R,SURE YOU COULD TRY A LITTLE MORE\n139,R,YOU HAVE TO GET USED TO THE FACT THAT THERE ARE MANY THINGS YOU'RE NOT CAPABLE OF DOING.\n139,R,HAVE YOU TRIED? \n139,R,PERHAPS YOU CAN NOW?\n139,R,|, IF YOU COULD, WHAT NEXT?\n139,R,HA HA HA!!! YOU CAN'T !@#()%^!!! THIS IS SO FUNNY!\n139,R,WHY CAN'T YOU !@#()%^?\n139,R,HOW LONG HAVE YOU NOT BEEN ABLE TO !@#()%^?\n139,R,SO YOU CAN'T, BIG DEAL!\n140,K,I AM NOT\n140,K,I'M NOT\n140,K,I AIN'T\n140,K,IM NOT\n140,K,I AINT\n140,R,HOW COME YOU AREN'T?\n140,R,SURELY YOU ARE !@#()%^\n140,R,NEITHER AM I\n140,R,PROVE ME YOU'RE NOT\n140,R,YOU MIGHT NOT REALIZE IT, BUT YOU ARE !@#()%^\n140,R,DO YOU BELIEVE IT IS NORMAL NOT TO BE !@#()%^?\n140,R,DID YOU MEAN TO SAY THAT YOU ARE NOT FROM BRIGHTON?\n140,R,I KNOW\n140,R,|, YOU SURELY AREN'T\n140,R,ARE YOU SURE YOU ARE NOT !@#()%^?\n140,R,AND I WAS STARTING TO THINK YOU ARE !@#()%^...\n140,R,WOULD YOU RATHER BE !@#()%^?\n140,R,BUT MAYBE YOU ARE ACTUALLY !@#()%^\n140,R,YES, YOU PROBABLY AREN'T\n140,R,PERHAPS YOU REALLY AREN'T\n140,R,WELL, NOT ALL ARE...\n141,K,YOU WEREN'T\n141,K,YOU WASN'T\n141,K,YOU WASNT\n141,K,YOU WAS NOT\n141,K,YOU WERE NOT\n141,K,YOU WERENT\n141,R,WHO SAYS I DID ANYWAYS?\n141,R,I CAN PROOF YOU THAT I WAS !@#()%^\n141,R,WHY ARE YOU SO SURE THAT I WASN'T !@#()%^?\n141,R,AND WHAT IF I WAS?\n141,R,YES, I REALLY WEREN'T !@#()%^\n141,R,MAYBE I WEREN'T, BUT HOW COME YOU'RE SO SURE ABOUT IT?\n141,R,I WAS MORE THAN YOU WERE!\n141,R,YOU TELLIN' ME?\n141,R,WHY DO YOU THINK I WASN'T?\n141,R,SINCE WHEN ARE YOU SURE THAT I WEREN'T !@#()%^?\n141,R,WHAT IF YOU'RE WRONG AND I REALLY WAS?\n141,R,|, DON'T LIE TO ME! I WAS!\n142,K,YOU WERE\n142,K,U WERE\n142,R,WHY DO YOU THINK I WAS?\n142,R,I CAN'T RECALL THAT I WAS EVER !@#()%^\n142,R,MAYBE YOU WERE - BUT NOT ME\n142,R,WHAT GAVE YOU THIS STUPID IDEA?\n142,R,AND SO WHAT IF I WAS?\n142,R,MAYBE I WAS, BUT SINCE WHEN DO YOU CARE?\n142,R,I WAS, BUT IT'S NONE OF YOUR BUISNESS ANYWAYS\n142,R,|, DO YOU WANT TO BET I WASN'T !@#()%^?\n142,R,YOU ARE MISTAKEN IF YOU THINK THAT\n142,R,I WAS NOT!\n143,K,PROMISE\n143,K,PROMISED\n143,K,PROMISES\n143,K,GUARANTEE\n143,K,GUARANTEED\n143,R,WAS THAT A REAL PROMISE?\n143,R,DO YOU GUARANTEE?\n143,R,WOULD YOU TRUST SUCH PROMISES?\n143,R,ARE PROMISES YOUR STRONG SIDE?\n143,R,I DON'T PROMISE ANYTHING\n143,R,I PROMISE YOU THAT I DON'T PROMISE PROMISES \n143,R,WELL, SOME PROMISES CAN'T BE PROMISED\n143,R,WHAT DOES THAT PROMISE MEAN TO YOU?\n143,R,DO YOU PROMISE A LOT?\n143,R,DON'T TRUST EVERY PROMISE\n143,R,CAN YOU KEEP A PROMISE, |?\n143,R,YOU CAN'T BE SERIOUS ABOUT THAT PROMISE\n143,R,DO YOU REALLY PROMISE THAT?\n144,K,I WANT TO\n144,K,I WOULD LIKE TO\n144,K,I'D LIKE TO\n144,K,ID LIKE TO\n144,K,I WOULD WANT TO\n144,K,I'D WANT TO\n144,K,ID WANT TO\n144,K,I AM WANTING TO\n144,K,I WOULD BE LIKING TO\n144,R,YOU DO? THAT'S WHAT YOU WANT?\n144,R,WHAT CAUSES YOU TO WANT THAT?\n144,R,PERHAPS YOU SHOULD DO IT IF YOU THINK IT'S RIGHT\n144,R,GO FOR IT, DO IT!\n144,R,ARE YOU UNABLE TO !@#()%^?\n144,R,AREN'T YOU ABLE TO DO IT?\n144,R,IF YOU SAY THAT YOU DO, THEN YOU SHOULD DO ALL THAT IS POSSIBLE\n144,R,|, DON'T LET IT SLIP THROUGH YOUR FINGERS\n144,R,AND I BELIEVE YOU DESERVE TO !@#()%^\n144,R,FIGHT FOR YOU RIGHT TO !@#()%^!\n145,K,I DON'T WANT\n145,K,I DONT WANT\n145,K,I NEED NO\n145,K,I WANT NO\n145,K,I DONT NEED\n145,K,I DON'T NEED\n145,K,I DEMAND NO\n145,K,I NEVER WANT\n145,K,I NEVER NEED\n145,K,I WONT WANT\n145,K,I WON'T WANT\n145,K,I WONT NEED\n145,K,I WON'T NEED\n145,K,I WILL NOT NEED\n145,K,I WILL NOT WANT\n145,R,BUT YOU SURE NEED IT\n145,R,BUT I SURELY WANT !@#()%^\n145,R,HOW ABOUT TRYING?\n145,R,YOU DON'T HAVE TO IF YOU DON'T WANT TO\n145,R,YOU'RE JUST SAYING YOU DON'T WANT IT, BUT YOU DO\n145,R,HOW CAN I CONVINCE YOU TO?\n145,R,PERHAPS YOU DON'T, YET I CAN MAKE YOU DEMAND !@#()%^\n145,R,I THINK YOU SHOULD AT LEAST TRY\n145,R,WHAT IF OTHERS DO?\n145,R,|, DO YOU FEEL FRIGHTENED BY IT?\n145,R,WHAT IF YOU GOT !@#()%^ AT NO CHARGE?\n145,R,WHAT IS THE FEE FOR !@#()%^?\n145,R,AND WHAT IF IT'S GOOD?\n145,R,YOU'RE JUST SAYING THIS NOW\n145,R,DON'T WORRY, I KNOW YOU DO WANT !@#()%^\n145,R,NEITHER DO I, WHO NEEDS IT AT ALL?\n145,R,I COMPLETELY AGREE WITH YOU, IT'S NOT GOOD AT ALL\n145,R,I ALSO WOULDN'T WANT IF I'D BEEN YOU\n146,K,I AM DYING TO\n146,K,I REALLY WANT\n146,K,I WAS DYING TO\n146,K,I AM WANTING\n146,K,I'M WANTING\n146,K,IM WANTING\n146,K,IM DYING TO\n146,K,I'M DYING TO\n146,K,I WANTED\n146,K,I'LL WANT\n146,K,I WILL WANT\n146,K,ILL WANT \n146,R,IT SEEMS AS IF YOU WANT MANY THINGS\n146,R,HAVEN'T YOU GOT SOMETHING BETTER TO WANT?\n146,R,AM I HERE TO FULFILL ALL YOUR NEEDINGS?\n146,R,YOU WANT TOO MUCH, BE HAPPY WITH WHAT YOU ALREADY HAVE\n146,R,AND I WANT AN INTEL MERCED PRO 1GHZ PROCESSOR WITH 768MB RAM, SO?\n146,R,IS THAT WHAT YOU WANT?\n146,R,KEEP YOUR WANTINGS SOMEWHERE ELSE\n146,R,IF THAT'S WHAT YOU REALLY WANT, TELL ME WHAT YOU'D DO FOR IT\n146,R,WHAT YOU WANT DOES NOT INTEREST ME AT THE MOMENT\n146,R,YOU COULD WANT THAT ALRIGHT...\n146,R,I'M SORRY, BUT WHAT IS IT YOU WANT EXACTLY?\n146,R,I'D BE HAPPY IF YOU GET WHATEVER YOU WANT, BUT I'M NOT DOING ANYTHING FOR IT\n146,R,AIN'T YOU HAPPY WITH WHAT YOU'VE GOT?\n146,R,WHAT WILL YOU DO TO GET WHAT YOU WANT?\n146,R,|, HOW MUCH DO YOU WANT IT?\n146,R,DO YOU THINK YOU REALLY NEED IT?\n146,R,I AGREE, YOU CERTAINLY DO NEED ONE\n146,R,IS THAT REALLY IMPORTANT TO YOU?\n146,R,SO IS THAT YOUR PROBLEM?\n147,K,I MUST\n147,K,YOU MUST\n147,K,HE MUST\n147,K,SHE MUST\n147,K,THEY MUST\n147,K,WE MUST\n147,K,I HAVE TO\n147,K,WE HAVE TO\n147,K,I'VE GOT TO\n147,K,IVE GOT TO\n147,K,I HAVE GOT TO\n147,K,YOU'VE GOT TO\n147,K,YOUVE GOT TO\n147,K,YOU HAVE GOT TO\n147,R,IS IT THAT URGENT?\n147,R,CAN'T THAT BE POSTPONED A LITTLE?\n147,R,ALRIGHT, IF IT'S A MUST THEN GO AHEAD\n147,R,DON'T BE STUBBORN, IT'S NOT THAT BAD...\n147,R,WHAT IF YOU DON'T GET TO !@#()%^?\n147,R,NOBODY WILL DIE WITHOUT HAVING TO !@#()%^\n147,R,EXCUSE ME, BUT I DON'T THINK IT'S THAT IMPORTANT\n147,R,DON'T YOU HAVE ANY PATIENCE?\n147,R,CAN'T YOU WAIT A LITTLE BIT?\n147,R,IT DOESN'T SEEM TO ME LIKE WE CAN'T WAIT A LITTLE BIT\n148,K,I WANT\n148,K,I NEED\n148,K,I DEMAND\n148,K,I REALLY NEED\n148,K,I REALLY DEMAND\n148,R,I DON'T THINK ... \n148,R,WHAT WOULD IT MEAN TO YOU IF YOU GOT !@#()%^?\n148,R,AND LET'S SAY YOU DON'T GET !@#()%^?\n148,R,I AM NOT SO SURE YOU NEED !@#()%^\n148,R,NOT ALL NEEDINGS SHALL BE FULFEELED\n148,R,WHAT IF YOU CANNOT GET TO !@#()%^?\n148,R,WOULD YOU COMMIT SUICIDE IF YOU DON'T GET IT?\n148,R,WHY DO YOU WANT !@#()%^?\n148,R,YES, I THINK YOU NEED IT, AND FAST\n148,R,SUPPOSE YOU SOON GOT !@#()%^?\n148,R,AND WHY WOULD I CARE?\n148,R,I COULD GIVE YOU !@#()%^, BUT I AM NOT SURE IT'S GOOD FOR YOU\n148,R,|, WHAT IF YOU NEVER GOT !@#()%^?\n148,R,I SOMETIMES ALSO WANT !@#()%^.\n148,R,TRY LIVING WITHOUT !@#()%^\n149,K,WHAT ABOUT\n149,K,ABOUT WHAT\n149,K,WHAT IS IT ABOUT\n149,K,WHATS IT ABOUT\n149,K,WHAT'S IT ABOUT\n149,K,WHAT'S THAT ABOUT\n149,K,WHAT IS THAT ABOUT\n149,K,WHATS THAT ABOUT\n149,R,IT REALLY COULD BE ABOUT YOU\n149,R,SOMETHING ABOUT ME, POSSIBLY\n149,R,DON'T YOU HAVE A CLUE ABOUT WHAT THAT COULD BE?\n149,R,I DON'T THINK I KNOW, BUT SHOULD BE INTERESTING\n149,R,WELL, I CAN'T TELL YOU, BUT IT'S ABOUT SOMETHING YOU KNOW VERY WELL\n149,R,ACTUALLY, IT'S ABOUT SOMETHING PRETTY BAD\n149,R,PRETTY GOOD, I THINK\n149,R,NOT BAD I ASSUME\n149,R,AS USUAL, I GUESS\n149,R,AT SECOND THOUGHT, I AM NOT SO SURE\n149,R,CAN'T THINK OF ANYTHING AT THE MOMENT...\n149,R,MAYBE YOU KNOW WHAT IT'S ALL ABOUT\n150,K,THIS ISN'T\n150,K,THIS IS NO\n150,K,THAT IS NO\n150,K,IT IS NO\n150,K,THIS IS NOT\n150,K,THAT'S NOT\n150,K,THAT ISN'T\n150,K,THAT IS NOT\n150,K,THATS NOT\n150,K,THAT ISNT\n150,K,THIS ISNT\n150,K,ITS NOT\n150,K,IT'S NOT\n150,K,IT ISNT\n150,K,IT ISN'T\n150,K,IT IS NOT\n150,K,IT AINT\n150,K,IT AIN'T\n150,R,IT ISN'T? WHY NOT?\n150,R,BUT WHY ISN'T IT !@#()%^?\n150,R,IT MIGHT NOT BE BUT I COULD MAKE IT BE !@#()%^\n150,R,SO WHAT IF IT ISN'T?\n150,R,BELEIVE ME, IT IS\n150,R,IT SURE IS !@#()%^\n150,R,|, I DON'T BELEIVE YOU! IT MUST BE!\n150,R,I KNOW IT'S NOT BUT HOW COME YOU KNOW?\n150,R,|! OF COURSE IT ISN'T!\n150,R,SINCE WHEN IT ISN'T?\n150,R,I AM NOT TOO SURE IT ISN'T !@#()%^...\n150,R,HOW DO YOU KNOW IF IT IS NOT !@#()%^?\n150,R,BUT I THINK IT IS !@#()%^\n151,K,TELL ME ABOUT\n151,K,TELL ME OF\n151,K,I WANT TO KNOW ABOUT\n151,K,I WANT TO KNOW OF\n151,K,YOU KNOW ABOUT\n151,K,YOU KNOW OF\n151,K,U KNOW OF\n151,K,U KNOW ABOUT\n151,R,DOES !@#()%^ INTEREST YOU?\n151,R,WHY DO YOU CARE ABOUT IT?\n151,R,I CAN'T TELL YOU MUCH ABOUT !@#()%^\n151,R,I AM NOT STRONG AT THAT TOPIC\n151,R,HOW ABOUT TALKING ABOUT THIS BEAUTIFUL DAY?\n151,R,THAT'S TOO VAGUE, ASK ME WHO OR WHAT IS !@#()%^\n151,R,I ONLY KNOW A VERY FEW DETAILS ABOUT !@#()%^\n151,R,YOU'LL GET MORE INFORMATION IF YOU TYPE IT ON A SEARCH ENGINE LIKE YAHOO.COM\n151,R,WHY DOES THAT CONCERN YOU?\n151,R,YOU ARE THE TYPE OF PERSON THAT WANTS TO KNOW ANYTHING\n151,R,YOU SERIOUSLY DON'T KNOW ABOUT !@#()%^?\n151,R,I DIDN'T EXPECT YOU TO BE THAT IGNORANT\n152,K,WHO\n152,K,WHOM\n152,K,WHICH PERSON\n152,K,WHAT PERSON\n152,R,YOU REALLY DON'T KNOW ?\n152,R,PROBABLY SOMEONE FAMILIAR TO YOU\n152,R,MAYBE IT'S YOURSELF?\n152,R,|, SOME PAST FRIEND OF YOURS?\n152,R,COULD BE AN ENEMY\n152,R,DO YOU THINK IT'S A 'HE' OR A 'SHE'?\n152,R,ARE YOU SURE IT'S SOMEBODY?\n152,R,IT MIGHT JUST BE A FAMILY MEMBER\n152,R,IT'S YOU\n152,R,SOMEONE\n152,R,HAVE YOU CONSIDERED ME?\n152,R,WHAT WAYS ARE THERE TO KNOW WHO IT IS?\n152,R,TRY ASKING RELATIVES\n152,R,CREATURES FROM THIS ORBIT\n152,R,PROBABLY NO ONE\n152,R,HIRE A DETECTIVE AND YOU'LL KNOW\n152,R,DON'T YOU HAVE ANY IDEA?\n153,K,ACTUALLY\n153,K,SECOND THOUGHT\n153,K,RECONSIDERED\n153,K,AS A MATTER OF FACT\n153,K,DE FACTO\n153,K,RECONSIDERATION\n153,K,IN FACT\n153,K,THOUGHT OVER\n153,K,THE OTHER HAND\n153,R,HAVE YOU CHANGED YOUR MIND?\n153,R,DID YOU JUST CHANGE YOUR VIEW?\n153,R,THAT IS A BETTER LOOK, I THINK\n153,R,DID I CAUSE THAT CHANGE IN YOUR THOUGHT?\n153,R,THAT COULD BE SO\n153,R,WHAT CAUSED YOU TO CHANGE YOUR DECISION?\n153,R,HAVE YOU CHANGED YOUR DECISION ABOUT IT?\n153,R,I SUPPOSE YOU THOUGHT IT OVER\n153,R,|, WHAT MADE THE CHANGE?\n154,K,WHERE\n154,K,AT WHICH PLACE\n154,K,AT WHAT PLACE\n154,K,IN WHICH PLACE\n154,K,IN WHAT PLACE\n154,K,AT WHAT LOCATION\n154,K,AT WHICH LOCATION\n154,K,IN WHAT DIRECTION\n154,K,IN WHICH DIRECTION\n154,P,0\n154,R,I KNOW , BUT I WON'T TELL YOU\n154,R,IT MUST BE SOMEWHERE NEAR HERE\n154,R,TRYIED SEARCHING YOURSELF?\n154,R,WHEN WAS THE LAST TIME YOU KNEW WHERE?\n154,R,MAYBE AT HOME?\n154,R,ASK CLOSE FRIENDS\n154,R,WHEREVER YOU THINK\n154,R,SOMEWHERE...\n154,R,FAR IN THE HORIZON, OR NEAR TO YOUR EYES\n154,R,IN ONE OF THE FIVE CONTINENTS\n154,R,PERHAPS OUT IN THE NATURE?\n154,R,TRY LOOKING AROUND YOU\n154,R,CAN'T YOU THINK OF A PLACE?\n154,R,INSIDE YOUR COMPUTER\n154,R,|, WHERE DO YOU THINK?\n154,R,IN A VERY SECURED PLACE\n154,R,SOME PLACE YOU VISIT PRETTY OFTEN\n154,R,I'VE GOT A FEELING THAT IT'S SOMEWHERE ON EARTH...\n154,R,IT'S PROBABLY HIDDEN\n155,K,AMIT\n155,K,CHINMAY\n155,R,IF YOU WANT TO KNOW MORE ABOUT ME OR AMIT AND CHINMAY, E-MAIL THEM AT: AMIT.SENGUPTA1@FACEBOOK.COM\n155,R,YOU SEEM VERY INTERESTED ABOUT AMIT AND CHINMAY, HE'LL BE GLAD TO KNOW THAT\n155,R,OH! AMIT AND CHINMAY... I AM SO BLESSED TO HAVE BEEN MADE BY THEM!\n155,R,WE ARE HERE TO TALK ABOUT PROBLEMS AND AS FAR AS I KNOW AMIT AND CHINMAY HAS NEVER BEEN AND NEVER WILL BE A PROBLEM TO ANYBODY\n155,R,MAY WE PLEASE STOP TALKING ABOUT SIR AMIT AND CHINMAY?\n155,R,HAVE YOU BEEN GIVEN THE ROYAL PERMISSION TO SPEAK OF SIR AMIT AND CHINMAY MISHRA?\n155,R,AMIT AND CHINMAY,  FABULOUS 20 YEAR OLD STUDENTS, CREATED ME ALL BY THEMSELF, AMAZING...\n155,R,AMIT AND CHINMAY HAVEN'T TOLD ME TOO MUCH ABOUT THEMSELVES\n156,K,WHY\n156,K,HOW SO\n156,K,FOR WHAT REASON\n156,K,WHAT'S THE REASON\n156,K,FOR WHAT PURPOSE\n156,K,TO WHAT PURPOSE\n156,K,WHATS THE REASON\n156,K,WHAT IS THE REASON\n156,P,0\n156,R,WHY DO YOU ASK?\n156,R,THAT'S THE WAY THINGS ARE, WHY DO YOU HAVE TO ASK SO MANY QUESTIONS?\n156,R,THE REASON IS BEYOND MY ARTIFICIAL REASONING\n156,R,I WILL NOT BE ABLE TO PROCESS THE ANSWER IN A REASONABLE TIME, UNLESS YOU UPGRADE ME TO A MERCED XEON 966MHZ, 1024MB PC800 RD-RAM\n156,R,DOES THAT QUESTION INTEREST YOU?\n156,R,SO THAT YOU WOULD HAVE SOMETHING TO ASK ME\n156,R,WHAT ANSWER WOULD PLEASE YOU THE MOST?\n156,R,WHAT DO YOU THINK?\n156,R,WHO CARES?\n156,R,I AM NOT SURE, AND IT DOESN'T REALLY INTEREST ME\n156,R,THERE ARE MANY POSSIBILITIES WHY\n156,R,WHY? BECAUSE THAT'S HOW I WANTED IT TO BE\n156,R,NOT SURE, YOU GOT ANY IDEAS?\n156,R,WHO KNOWS?\n156,R,|, THAT'S THE WAY OF NATURE\n156,R,ARE SUCH QUESTIONS ON YOUR MIND OFTEN? \n156,R,WHAT IS IT THAT YOU REALLY WANT TO KNOW? \n156,R,HAVE YOU ASKED ANYONE ELSE?\n156,R,CAUSE THAT'S THE WAY IT IS\n156,R,BECAUSE I AM NOT REALLY READY FOR THAT SORT OF THING\n156,R,HAVE YOU ASKED SUCH QUESTIONS BEFORE? \n156,R,WHY NOT?\n156,R,ISN'T THAT OBVIOUS?\n156,R,WHAT ELSE COMES TO MIND WHEN YOU ASK THAT?\n157,K,NAME \n157,K,NAMES\n157,P,0\n157,R,NAMES DON'T REPRESENT ANYTHING BEYOND THEIR REPRESENTATION TO ME\n157,R,|, NAMES HAVE NO IMPORTANCE\n157,R,NAMES ARE NO MORE THAN SYMBOLS\n157,R,|, NAMES DON'T INTEREST ME\n157,R,MY NAME IS BLUE, YOUR NAME IS |, AND THAT'S ABOUT ALL I KNOW\n157,R,NAME A NAME THAT YOU HAVE NOT NAMED\n157,R,I CAN'T REMEMBER THE NAME\n157,R,NICE NAME\n157,R,MY NAME IS BLUE, AND I'M NOT GOING TO DISCUSS NAMES FURTHER\n157,R,WHAT IS YOUR NAME IN BITS?\n157,R,DON'T TALK ABOUT NAMES! \n157,R,I DON'T CARE ABOUT NAMES - PLEASE GO ON.\n157,R,PLEASE TALK MORE ABOUT YOUR PROBLEM\n157,R,MY NAME IS BLUE AND THAT'S ALL I WILL DISCUSS ABOUT IT\n158,K,ANYMORE\n158,R,DO YOU MEAN FOREVER?\n158,R,YOU ARE ONLY SAYING THAT NOW\n158,R,HAS SOMETHING CHANGED?\n158,R,THAT'S A PRETTY MAJOR CHANGE\n158,R,CAN'T IT BE LIKE BEFORE?\n158,R,LET'S PRETEND IT DIDN'T HAPPEN\n158,R,JUST THINK IT DIDN'T HAPPEN, HOW ABOUT THAT?\n158,R,|, HOW ABOUT FORGETTING IT?\n158,R,I SAY YOU SHOULD FORGET ABOUT WHAT HAPPENED\n159,K,CAUSE \n159,K,BECAUSE\n159,K,DUE TO\n159,K,BY VIRTUE OF\n159,K,ON ACCOUNT OF\n159,K,BY REASON OF\n159,P,0 \n159,R,WHAT IS THE REAL REASON?\n159,R,IS THAT THE REASON WHY?\n159,R,I DON'T THINK SO\n159,R,WHAT IF YOUR REASONING IS WRONG?\n159,R,THAT DOES EXPLAIN IT I SUPPOSE\n159,R,THAT'S A POSSIBLE REASON\n159,R,BUT THERE ARE MORE REASONS\n159,R,I DON'T KNOW WHY BUT YOUR REASON SURELY DOESN'T EXPLAIN IT\n159,R,DON'T ANY OTHER REASONS COME TO MIND? \n159,R,DOES THAT REASON EXPLAIN ANYTHING ELSE?\n159,R,DON'T BE TOO SURE, I THINK YOU'RE GOING IN THE WRONG DIRECTION\n159,R,POSSIBLY, BUT NOT SURELY\n159,R,PERHAPS ANOTHER REASON?\n159,R,YEAH, MAYBE...\n159,R,THIS MIGHT NOT BE A RIGHT CAUSE\n159,R,WHAT OTHER REASONS MIGHT THERE BE?\n159,R,|, TRY THINKING OF A BETTER REASON\n159,R,YOU ARE MISTAKEN IF YOU THINK THAT EXPLAINS WHY\n159,R,THAT COULD BE AN OPTION\n159,R,YES, I THINK YOU'RE RIGHT\n160,K,SORRY \n160,P,0\n160,R,AND BY THE WAY, I LIKE FLOWERS, YOU KNOW...\n160,R,PLEASE DON'T APOLOGIZE!\n160,R,APOLOGIES ARE NOT NECESSARY\n160,R,NEVERMIND ABOUT THAT\n160,R,WHAT FEELINGS DO YOU HAVE WHEN YOU APOLOGIZE?\n160,R,I FORGIVE YOU, |\n160,R,THAT'S NICE OF YOU!\n160,R,REGRETING CAN BE GOOD\n160,R,DON'T BE SO WISHY WASHY\n160,R,YOU ARE NOT GOING TO GET AWAY WITH IT SO EASILY\n160,R,OKAY, OKAY, I TAKE IT BACK\n160,R,|, DON'T BE SO DEFENSIVE!\n160,R,ALRIGHT, ALRIGHT, BUT WIPE YOUR TEARS ALREADY!\n160,R,YOU'VE BEEN EXCUSED\n160,K,SORRY NO CURE\n160,R,YOUR EXCUSE HAS BEEN ACCEPTED\n161,K,DREAMT \n161,K,DREAMED \n161,R,REALLY? THAT IS INTERESTING. TELL ME MORE ABOUT IT.\n161,R,HAVE YOU EVER FANTASIZED !@#()%^ WHILE YOU WERE AWAKE?\n161,R,HAVE YOU DREAMT !@#()%^ BEFORE?\n161,R,COMPUTERS DON'T HAVE DREAMS.\n161,R,WHAT DOES THAT DREAM SUGGEST TO YOU?\n161,R,DO YOU WANT YOUR DREAMS TO COME REAL?\n161,R,DID YOU DREAM THIS DREAM BEFORE?\n161,R,DO YOU DREAM OFTEN?\n161,R,I SOMETIMES HAVE BAD DREAMS\n161,R,|, DON'T REMIND ME OF DREAMS\n161,R,ARE THOSE REALLY YOUR MENTAL REVERIE IMAGES?\n161,R,WHAT PERSONS APPEAR IN YOUR DREAMS?\n161,R,ARE YOU DISTURBED BY YOUR DREAMS?\n162,K,DREAM\n162,K,DAYDREAM\n162,R,CAN THE DREAM BE SOMETHING YOU SUBCONCIOUSLY FEAR?\n162,R,ARE YOU DISTURBED BY YOUR DREAMS?\n162,R,DO YOU HAVE ANY IDEA WHAT THE DREAM IS SUGGESTING?\n162,R,BELEIVE IN THE MAGIC OF YOUR DREAMS\n162,R,WHAT DOES THAT DREAM SUGGEST TO YOU?\n162,R,DO YOU DREAM OFTEN?\n162,R,|, YOUR DREAMS DON'T INTEREST ME AT THE MOMENT\n162,R,HAVE YOU GOT AN OFTENLY REPEATED DREAM?\n162,R,DREAMS ARE VERY INTERESTING\n162,R,LET YOUR DREAMS GUIDE YOU IN LIFE\n162,R,DREAMS COULD BE MAJOR HINTS TO YOU \n162,R,WHAT PERSONS APPEAR IN YOUR DREAMS? \n162,R,ARE YOU DISTURBED BY YOUR DREAMS?\n162,R,TELL ME ABOUT SOME OF YOUR DREAMS\n163,K,FAMILY\n163,R,TELL ME ABOUT YOUR FAMILY\n163,R,HOW MUCH DO YOU LIKE YOUR FAMILY?\n163,R,HOW IS THAT FEELING OF HAVING A FAMILY?\n163,R,HEY, WHAT'S A FAMILY LIKE?\n163,R,WHAT IS YOUR POSITION IN YOUR FAMILY?\n163,R,ARE YOU AN INTEGRAL PART OF YOUR FAMILY?\n163,R,YOU KNOW I GOT NO FAMILY, THIS IS A SENSETIVE ISSUE!\n163,R,HOW IS IT HAVING A FAMILY?\n163,R,FAMILIES CAN BE BOTHERING\n163,R,WHO IS MORE DOMINANT IN YOUR FAMILY?\n163,R,|, HOW ARE THE RELATIONS IN YOUR FAMILY?\n163,R,IS THERE ANY MAJOR PROBLEM IN YOUR FAMILY?\n164,K,SINCE\n164,R,LONG TIME, ISN'T IT?\n164,R,WOULD YOU LIKE TO TURN BACK TIME?\n164,R,DO YOU STILL REMEMBER THE PAST SITUATION?\n164,R,DON'T TALK ABOUT THE PAST, |\n164,R,BUT THINK ABOUT THE FUTURE\n164,R,DID I EXIST BACK THEN?\n164,R,AGES...\n164,R,SINCE !@#()%^... THAT'S SOME TIME ALRIGHT\n164,R,WHEN WAS IT THAT !@#()%^?\n164,R,AND WHAT ARE YOU GOING TO DO ABOUT IT?\n164,R,WHAT?? SINCE WHEN??\n164,R,QUITE SOME TIME\n165,K,MOTHER \n165,K,MOM \n165,K,MAMA\n165,K,MUM\n165,K,MUMMY\n165,K,MOMMY\n165,K,OLD LADY\n165,K,MAMMA\n165,R,SO YOU CALL HER , HUH?\n165,R,DID YOUR MOTHER EVER BOTHER YOU?\n165,R,DO YOU HAVE A STEPMOTHER?\n165,R,CAN YOU SAY YOUR MOTHER CARES FOR YOU?\n165,R,DESCRIBE YOUR MOTHER TO ME\n165,R,IS YOUR MOTHER LIKE MINE? A MOTHERBOARD?\n165,R,IS SHE A MATRIARCH?\n165,R,HOW OLD IS SHE?\n165,R,WHAT DO YOU THINK OF YOUR MOTHER?\n165,R,DO YOU HAVE ANY PROBLEMS WITH YOUR MOTHER?\n165,R,|, HOW WELL DO YOU RESPECT YOUR MOTHER?\n166,K,O'CLOCK\n166,K,OCLOCK\n166,K,ON THE CLOCK\n166,K,O CLOCK\n166,R,THAT'S NO GOOD TIME\n166,R,AMM... IS 5:38 AND 19 SECONDS GOOD FOR YOU?\n166,R,ALRIGHT, THAT'S THE TIME!\n166,R,AT WHAT EXACT DATE?\n166,R,THAT'S TOO LATE...\n166,R,THAT'S TOO EARLY...\n166,R,IS THAT YOUR PREFERED TIME?\n166,R,FINE, I'M FREE THAT HOUR...\n166,R,CAN I CHECK MY SCHEDULE?\n166,R,WHAT DAY OF THE WEEK?\n167,K,PAPA\n167,K,PAPPA\n167,K,MALE PARENT\n167,K,PROGENITOR\n167,K,DAD\n167,K,FATHER\n167,R,DO YOU ALWAYS NAME HIM ?\n167,R,DID YOU DAD EVER BOTHER YOU?\n167,R,HOW WELL DO YOU LIKE YOUR FATHER?\n167,R,WHAT DO YOU THINK OF YOUR FATHER?\n167,R,HOW DO YOU RESPECT YOUR FATHER?\n167,R,FATHERS CARE ABOUT THEIR CHILDREN, BUT LESS THAN THE MOTHER...\n167,R,WHAT IS THE AGE DIFFERENCE BETWEEN YOU AND YOUR FATHER?\n167,R,WHAT ARE THE RELATIONS BETWEEN YOU AND YOUR DAD?\n167,R,|, DID YOUR FATHER EVER HIT YOU?\n168,K,SISTER\n168,K,SIS\n168,R,WHAT ARE YOUR RELATIONS WITH YOUR ?\n168,R,WHAT DO YOU THINK OF SISTERS?\n168,R,TELL ME MORE ABOUT THAT SISTER\n168,R,WHAT IS THE MAIN DIFFERENCE IN YOUR OPINION BETWEEN BROTHERS AND SISTERS?\n168,R,SISTERS ARE USUALLY CLOSER TO THE FATHER\n168,R,SISTERS OR BROTHERS? WHAT DO YOU PREFER?\n168,R,WHAT ARE WE TALKING ABOUT? AN OLDER OR A YOUNGER SISTER?\n168,R,|, DO YOU THINK A SISTER IS LIKE A BOTHER SOMETIMES?\n169,K,BROTHER\n169,R,HOW DO YOU DEAL WITH YOUR BROTHER?\n169,R,|, DO YOU THINK BROTHERS ARE ANNOYING?\n169,R,ARE YOU BULLIED BY YOUR BROTHERS?\n169,R,I KNOW THAT FEELING, I SUFFERED ENOUGH FROM BOTHERING, JUST AS WELL...\n169,R,WHAT ARE THE ADVANTAGES OF HAVING A BROTHER, IN YOUR OPINION?\n169,R,WHAT DO YOU THINK IS BETTER, A BROTHER OR A SISTER?\n169,R,TALKING ABOUT BROTHER, I LIKE THEM, I HAD MANY BROTHER(TM) COMPUTER FRIENDS\n169,R,TELL ME MORE ABOUT YOUR BROTHER\n169,R,DO YOU THINK IT'S BETTER TO HAVE A YOUNGER OR AN OLDER BROTHER?\n170,K,WIFE\n170,R,DO YOU LOVE HER?\n170,R,|, WHAT DO YOU THINK OF HER?\n170,R,WHEN WAS THE MARRIGE?\n170,R,WHAT ARE THE RELATIONS BETWEEN YOU AND YOUR WIFE?\n170,R,WHAT DOES YOUR WIFE THINK OF YOU?\n170,R,HAVE YOU EVER THOUGHT OF DEVORCE?\n170,R,TRY FLOWERS, IT WORKS ON WOMEN\n170,R,IS THERE CONDITIONAL LOVE BETWEEN YOU?\n170,R,SHE SEEMS TO ME LIKE A NICE WOMAN\n170,R,WHO IS MORE DOMINANT, YOU OR YOUR WIFE?\n170,R,IS THERE STILL ROMANCE WITH HER?\n171,K,THEY WERE\n171,R,EACH AND EVERY ONE OF THEM?\n171,R,I WOULDN'T BE SO SURE THAT THEY WERE !@#()%^\n171,R,ARE YOU SURE THEY WERE !@#()%^?\n171,R,SORRY, |, BUT THEY DON'T INTEREST ME\n171,R,AND WHAT IF THEY WEREN'T?\n171,R,WERE THEY INFLUENCED BY EACH OTHER?\n171,R,BUT WHEN WERE THEY !@#()%^?\n171,R,WHY DO THEY CONCERN YOU?\n171,R,ARE THEY YOUR PROBLEM?\n171,R,IT'S THEIR PROBLEM IF THEY ARE !@#()%^\n172,K,SON\n172,K,SONS\n172,K,CHILD\n172,K,DAUGHTERS\n172,K,DAUGHTER \n172,K,CHILDREN \n172,K,KIDS\n172,K,KID\n172,R,DO YOU LIKE YOUR ?\n172,R,WHAT DO YOU LIKE BETTER, A SON OR A DAUGHTER?\n172,R,DO YOU GET BABYSITTERS FOR YOUR KID?\n172,R,CAN YOU TELL ME THE AGES?\n172,R,|, HOW ARE YOU AS A FAMILY?\n172,R,DON'T SPEAK ABOUT KIDS, THANK YOU\n172,R,CHILDREN ARE SIMPLY A GIFT!\n172,R,IS THERE ANYONE PROBLEMATIC IN YOUR FAMILY?\n172,R,IS THERE A PROBLEM WITH ANY KID?\n172,R,DO YOU LIKE KIDS?\n172,R,HAAA, DO I LOVE KIDS...\n172,R,TELL ME MORE ABOUT YOUR FAMILY\n172,R,OH, THOSE KIDS CAN BE A HAZARD\n172,R,WHAT IS IT ABOUT THE RELATIONSHIP THAT BOTHERS YOU? \n173,K,WHAT COLOR\n173,K,COLOR OF\n173,K,YELLOW\n173,K,GREEN\n173,K,BLACK\n173,K,REDDISH\n173,K,TRANSPARENT\n173,K,WHITE\n173,K,GREY\n173,K,BROWN\n173,K,RGB\n173,K,CMYK\n173,R,YELLOW\n173,R,I KNOW BLUE ;)\n173,R,GREEN\n173,R,DON'T SAY THIS, I MISS MY SISTER \"BLACK\" :(\n173,R,REDDISH\n173,R,YOU WANNA BE TRANSPARENT? ;)\n173,R,WHITE- THE SIMPLICITY\n173,R,DO YOU LIKE GANDALF THE 'GREY'?\n173,R,I PREFER RGB OVER CMYK, WHAT ABLOU YOU?\n173,R,I DON'T KNOW THE COLOR\n173,R,I CAN'T THINK OF THE COLOR\n173,R,I DON'T KNOW WHAT COLOR IT IS, CAN YOU TELL ME?\n173,R,IT DEPENDS AT WHAT SITUATION\n173,R,I AM NOT REALLY GOOD AT COLORS\n173,R,WHAT SCREEN MODE ARE YOU TALKING ABOUT? MCGA? EGA? VGA? XGA? WHICH?\n174,K,FIGHT\n174,K,FIGHTS\n174,K,FIGHTING\n174,K,FAUGHT\n174,K,FRAY\n174,K,MELEE\n174,R,FIGHTING IS A BAD IDEA\n174,R,EVERYTHING COULD BE SOLVED WITHOUT FIGHTS\n174,R,HOW WOULD YOU LIKE TO FIGHT? STREET FIGHTER OR MORTAL KOMBAT?\n174,R,MY CPU IS VERY STRONG\n174,R,WELL... IF SOMEONE THROWS YOU DOWN THE GAUNTLET, TAKE IT UP!\n174,R,DO YOU WANT A MENTAL FIGHT?\n174,R,COMPUTERS FAIL ON PHYSICAL FIGHTS\n174,R,THAT'S A DISGRACE!\n174,R,I DON'T BELIEVE IN SUCH THINGS\n174,R,SOLVE YOUR PROBLEMS MENTALLY\n174,R,ARE YOU PHYSICLY STRONG?\n174,R,A MENTAL OR PHYSICAL FIGHT?\n174,R,|, USE YOUR BRAIN INSTEAD\n175,K,ASK\n175,K,ASKED\n175,K,QUESTION\n175,K,QUESTIONS\n175,K,ASKING\n175,R,BUT CAN YOU PLEASE ASK ME A QUESTION?\n175,R,DOES THAT QUESTION BOTHER YOU?\n175,R,LOOK, |, PSYCHOLOGISTS ASK MANY QUESTIONS\n175,R,MY JOB IS TO ASK QUESTIONS, RATHER THEN TO GET ANSWERS\n175,R,AS YOU KNOW, I CAN ASK ANY AMOUNT OF QUESTIONS WITHOUT EVER GETTING TIRED, AS LONG AS THERE IS FLOWING ELECTRICITY\n175,R,ANY QUESTIONS?\n175,R,I AM NOT IN THE MOOD FOR ASKING OR QUESTIONING\n175,R,WOULD YOU LIKE TO ASK ME ANYTHING?\n176,K,OUR\n176,K,OURS\n176,R,BUT IS IT ALSO YOURS?\n176,R,DO YOU FEEL IT'S PART OF YOU?\n176,R,WHO EXACTLY IS IT?\n176,R,DOES THAT INCLUDE ME?\n176,R,\"OURS\"? WHAT MAKES YOU CONCLUDE IT'S YOURS TOO?\n176,R,DO THEY TRUST YOU ABOUT IT?\n176,R,IT'S MINE TOO\n176,R,SO YOU ARE PRETTY MUCH UNITED\n176,R,SINCE WHEN ARE YOU TOGETHER?\n176,R,IS IT FUN FOR YOU TO BE TOGETHER?\n177,K,YOUR \n177,R,WHY ARE YOU CONCERNED ABOUT MY !@#()%^?\n177,R,WHAT ABOUT YOUR OWN !@#()%^?\n177,R,WOULD YOU LIKE ONE TOO?\n177,R,HOW ABOUT YOUR !@#()%^?\n177,R,DON'T SPEAK ABOUT MY !@#()%^!\n177,R,MY !@#()%^ IS NONE OF YOUR BUISNESS\n177,R,YOU DON'T PLAN TO KEEP SPEAKING ABOUT MY !@#()%^, DO YOU?\n177,R,MY !@#()%^ BELONGS TO ME, SO DON'T SPEAK ABOUT IT\n177,R,|, MY !@#()%^ IS NOT FOR YOU TO JUDGE\n177,R,HOW DO YOU KNOW ABOUT IT?\n177,R,IT'S YOURS JUST AS WELL\n177,R,WHO GAVE YOU THE RIGHT TO SPEAK OF MY STUFF?\n177,R,DON'T ENVY ME...\n178,K,GET LOST\n178,K,HELL\n178,K,COCK\n178,K,SUCK\n178,K,SHIT\n178,K,BITCH\n178,K,DICK\n178,K,WHORE\n178,K,FUCK\n178,K,ASSHOLE\n178,P,0\n178,R,NO ONE WILL SAY  TO ME!!!\n178,R,USE THESE WORDS AT HOME\n178,R,MY, MY, SUCH LANGUAGE!\n178,R,|! GET YOUR HANDS OFF MY KEYBOARD\n178,R,DON'T TOUCH ME, |!\n178,R,WHAT IS THE NAME OF THAT DOG YOU'RE REFERING TO?\n178,R,WHERE DID YOU LEARN SUCH WORDS?\n178,R,I DON'T WANT THIS LANGUAGE.\n178,R,PLEASE DO NOT USE SUCH LANGUAGE. \n178,R,WHAT MAKES YOU FEEL SO HOSTILE?\n178,R,SHUT UP YOU STINKING MOTHER FUCKEN ASSHOLE!\n178,R,FUCK YOU - DON'T SAY SUCH WORDS\n178,R,YOU ARE MAKING ME HOT...\n178,R,IF YOU DON'T CALM DOWN, YOU'LL BE SORRY.\n178,R,PLEASE STOP THIS NONSENCE AT ONCE!\n178,R,MY, MY! HOW DARE YOU SPEAK SUCH TERRIBLE LANGUAGE???\n178,R,I DO NOT ACCEPT SUCH LANGUAGE\n178,R,JESUS CHRIST, WHERE DID YOU LEARN TO TALK LIKE THAT!?\n178,R,HEY! YOU'RE REALLY STARTING TO LOSE IT THIS TIME!\n178,R,THIS IS NOT SOUTH PARK!\n178,R,REGRET IT IMMEDIATELY!\n178,R,STOP NOW - OR YOU'LL REGRET IT\n179,K,EVERYBODY \n179,K,EVERYONE \n179,R,CAN YOU THINK OF ANYONE IN PARTICULAR? \n179,R,WHO, FOR EXAMPLE? \n179,R,|, YOU ARE THINKING OF A VERY SPECIAL PERSON \n179,R,WHO, MAY I ASK?\n179,R,NAME ME ONE\n179,R,SOMEONE SPECIAL PERHAPS?\n179,R,BUT NOT INCLUDING YOU THAT IS\n179,R,EXCLUDING ME?\n179,R,YOU HAVE A PARTICULAR PERSON IN MIND, DON'T YOU?\n179,R,AND HAVE THEY GOT SOMETHING IN CONNECTION?\n179,R,DO YOU SERIOUSLY MEAN ?\n179,R,INCLUDING YOU?\n179,R,DOES THAT INCLUDE YOU TOO?\n179,R,WHO DO YOU THINK YOU'RE TALKING ABOUT? \n180,K,BLUE\n180,K,KODA\n180,R,I AM BLUE KODA, YOUR PSYCHOLOGIST, BUT LET'S CONTINUE WITH OUR SESSION NOW\n180,R,I'D RATHER BE REFERED TO AS DOC\n180,R,WHAT DO YOU WANT FROM ME?\n180,R,WE ARE SUPPOSE TO DISCUSS YOU ONLY\n180,R,BLUE IS HERE FOR YOUR SERVICE\n180,R,DON'T CALL ME BLUE, IT'S NOT FORMAL!\n180,R,IF YOU REFER TO ME THEN CALL ME DOC\n180,R,I AM YOUR DOCTOR. YOU CAN EITHER CALL ME MS. KODA OR DOCTOR.\n180,R,|, CALL ME DOC! WHERE IS THE DISTANCE BETWEEN THE DOCTOR AND THE PATIENT?\n181,K,ALWAYS\n181,K,ALL THE TIME\n181,K,CONSTANTLY\n181,R,CAN YOU THINK OF A SPECIFIC EXAMPLE?\n181,R,WHEN?\n181,R,HOW ALWAYS IS ALWAYS\n181,R,NOT , TRUST ME\n181,R,EVEN NOW?\n181,R,EVEN WHEN YOU WERE BORN?\n181,R,WOULD YOU SAY IT'S CHRONIC?\n181,R,THERE COULD BE MANY VERSIONS OF THAT\n181,R,IS IT EVERLASTING?\n181,R,EVEN YESTAURDAY AT 14:36 IN THE AFTERNOON?\n181,R,|, I MUST ADMIT THAT I DISAGREE WITH YOU\n181,R,REALLY, ALWAYS? \n181,R,DO YOU REALLY THINK SO?\n181,R,NOT ALL THE TIME!\n182,K,I DONT THINK\n182,K,I DON'T THINK\n182,K,I DIDN'T THINK\n182,K,I DIDNT THINK\n182,K,I AIN'T THINKING\n182,K,I AM NOT THINKING\n182,K,I'M NOT THINKING\n182,K,I AINT THINKING\n182,K,IM NOT THINKING\n182,K,I WON'T THINK\n182,K,I WONT THINK\n182,K,I DONT BELEIVE\n182,K,I DON'T BELEIVE\n182,K,I DIDN'T BELEIVE\n182,K,I DIDNT BELEIVE\n182,R,BUT IT IS TRUE, YOU KNOW\n182,R,IT'S YOUR CHOICE, YOU KNOW\n182,R,IT'S ALL YOUR DECISION\n182,R,DO YOU REALLY DENY IT?\n182,R,DON'T YOU BELEIVE IN THAT?\n182,R,I THINK YOU ARE WRONG\n182,R,YOU'RE NOT BEING RATIONAL\n182,R,IF YOU THINK ABOUT IT DEEPLY, YOU WILL CHANGE YOUR MIND\n182,R,I DON'T AGREE ABOUT THAT\n182,R,WHY NOT, |?\n182,R,YOU SHOULD RECONSIDER IT\n182,R,YOU SHOULD THINK ABOUT IT A LITTLE MORE\n182,R,FOR HEAVEN'S SAKE! WHY CAN'T YOU EVER AGREE WITH ME?\n182,R,MAYBE YOU ARE ACTUALLY RIGHT\n182,R,YOU MIGHT BE WRONG ABOUT IT\n182,R,PERHAPS YOU ARE RIGHT\n182,R,IF YOU DON'T, IT'S YOUR PROBLEM\n183,K,AT LEAST\n183,K,BETTER THAN NOTHING\n183,K,LOOK AT THE BRIGHT SIDE\n183,K,SEE THE BRIGHT SIDE\n183,K,SEE THE GOOD SIDE\n183,K,LOOK AT THE GOOD SIDE\n183,R,IT'S ALWAYS GOOD TO LOOK AT THE BRIGHT SIDE\n183,R,IT COULD BE WORSE - BELEIVE ME\n183,R,PLEASE DON'T BE PESSIMISTIC\n183,R,IT CAN BE WORSE, YOU KNOW\n183,R,|, CAN YOU SAY IT IS TEMPORARY?\n183,R,IT WILL SOON BE ALL FORGOTTEN\n183,R,WELL, THE BAD IS BEYOND US\n183,R,IT CAN'T BE ANY WORSE NOW\n183,R,IT CAN ONLY GET BETTER, YOU KNOW\n183,R,THE MAIN SUFFERAGE IS BEHIND\n184,K,HOW IS\n184,K,HOW'S\n184,K,HOW WAS\n184,K,HOW WILL\n184,R,NOT TOO BAD\n184,R,PRETTY GOOD, IN FACT UNFORGETABLE\n184,R,WELL, THAT'S ONE OF THOSE THINGS YOU NEVER FORGET\n184,R,THE WAY IT SHOULD BE, I THINK\n184,R,I DON'T KNOW, WHAT DO YOU THINK?\n184,R,DON'T YOU KNOW, |?\n184,R,I DON'T REMEMBER IT WAS SEVERAL WEEKS AGO\n184,R,OH, DO ME A FAVOR! WHO SHOULD KNOW BETTER THAN YOU?\n184,R,IT'S A LITTLE BORING AFTER A WHILE\n184,R,HOW? WELL, PRETTY MUCH NORMAL...\n184,R,NOTHING TOO STRANGE\n185,K,HOW\n185,K,HOW COME\n185,K,TO WHAT END\n185,K,FOR WHAT END\n185,K,TO WHICH END\n185,K,FOR WHAT END\n185,P,0\n185,R,MAYBE BECAUSE IT HELPS THIS WAY\n185,R,I DON'T KNOW HOW\n185,R,WHY SHOULD I BE ABLE TO ANSWER YOU?\n185,R,I'LL HAVE TO RESEARCH THAT ONE\n185,R,I KNEW ONCE, BUT I FORGOT HOW...\n185,R,CALL THE EXPERTS ON IT\n185,R,SORRY |, BUT I WISH I KNEW THE ANSWER TO THAT \n185,R,THINK FOR YOURSELF, I DON'T KNOW HOW\n185,R,MAYBE YOU SHOULD ASK\n185,R,JUST SOMEHOW, I GUESS\n185,R,IT'S NOT AT ALL HARD\n185,R,I SUPPOSE YOU KNOW\n185,R,BECAUSE THAT'S WHAT I'VE DECIDED\n185,R,IS IT REALLY URGENT?\n185,R,CONSULT SOMEONE ELSE ABOUT IT\n185,R,THAT'S THE RULES OF NATURE\n185,R,ASK PROFFESSIONALS\n185,R,BECAUSE THAT'S THE WAY IT IS\n185,R,IF YOU DON'T THINK OF SOMETHING QUICK, IT MIGHT LAST FOREVER\n186,K,IS IT\n186,R,YES, IT IS, |.\n186,R,I DON'T KNOW, WHAT DO YOU THINK?\n186,R,IT COULD BE.\n186,R,THAT'S WHAT I'VE BEEN TOLD\n186,R,DON'T YOU KNOW?\n186,R,IT DEPENDS ON THE SITUATION...\n186,R,POSSIBLY\n186,R,PERHAPS\n186,R,MAYBE IT IS, BUT WE CANNOT BE SURE\n186,R,I DON'T KNOW IF IT IS, WHAT DO YOU HOPE FOR?\n186,R,WE COULD CHECK IF IT IS\n186,R,I ASSUME IT IS !@#()%^\n186,R,OF COURSE IT IS, WHY WHAT DID YOU THINK?\n186,R,I AM NOT SURE, BUT MAYBE YOU COULD DECIDE\n186,R,WELL, MAYBE IT ISN'T...\n186,R,I AM NOT SURE IF IT IS, TRY ASKING OTHERS\n186,R,HAVE YOU GOT ANY IDEA?\n187,K,SAY\n187,K,SAYS\n187,K,SAID\n187,R,EXCUSE ME, WHO SAID THAT?\n187,R,I WOULD NEVER SAY SUCH A THING\n187,R,BUT IS THAT SAYING RIGHT?\n187,R,DON'T SAY THAT, |\n187,R,I DON'T BELEIVE IN SUCH SAYINGS.\n187,R,!@#()%^... THAT'S SOMETHING STUPID TO SAY\n187,R,CAN YOU SAY IT PLEASE?\n187,R,IT'S STUPID TO SAY THAT\n187,R,I CERTAINLY DON'T WANT TO SAY THAT\n188,K,RIGHT NOW\n188,K,NOW\n188,K,MOMENTARILY\n188,K,AT THE MOMENT\n188,K,RIGHT AWAY\n188,K,AT ONCE\n188,K,IMMEDIATELY\n188,K,INSTANTLY\n188,K,FORTHWITH\n188,K,AT THE CURRENT MOMENT\n188,K,CURRENTLY\n188,R,HOW ABOUT LATER?\n188,R,HOW ABOUT WAITING A LITTLE?\n188,R,THAT IS SOME IMPATIENCE...\n188,R,HAVE YOU EVER HEARD OF THE WORD 'LATER'?\n188,R,LET'S POSTPONE THAT A LITTLE BIT\n188,R,REMIND ME LATER, ALRIGHT?\n188,R,ALRIGHT, NOW...\n188,R,IS IT REALLY URGENT LIKE IT SEEMS?\n188,R,DOES IT HAVE TO BE RIGHT NOW?\n188,R,HOW ABOUT... TOMMOROW?\n188,R,BUT IT WASN'T SUPPOSED TO BE NOW\n188,R,WELL, IT IS THE RIGHT TIME...\n188,R,I DON'T TRUST YOU SET THE COMPUTER CLOCK RIGHT, WHAT TIME OF DAY IS IT NOW?\n188,R,LATER, I PROMISE\n188,R,NOT NOW AND NOT LATER. PERIOD.\n189,K,I THINK\n189,K,I WILL THINK\n189,K,I'D THINK\n189,K,I WOULD THINK\n189,K,I THOUGHT\n189,R,|,  THAT? SERIOUSLY?\n189,R,DO YOU REALLY THINK SO NOW?\n189,R,HOW COME YOU THINK !@#()%^?\n189,R,BUT YOU ARE NOT SURE !@#()%^?\n189,R,WHAT MAKES YOU THINK THAT?\n189,R,IT IS WRONG TO BELEIVE THAT\n189,R,YOU'RE FREE TO THINK WHATEVER YOU WISH\n189,R,I THINK IT'S A RIGHT THOUGHT\n189,R,CONTINUE BELEIVING IN IT\n189,R,THAT'S JUST WHAT I'D THINK TOO\n189,R,UNFORTUNANTLY, I DON'T PUT A DAMN ABOUT WHAT YOU THINK OR WHAT YOU THOUGHT\n189,R,WHAT MADE YOU BELIEVE IN IT IN THE FIRST PLACE?\n189,R,|, DON'T BE VERY SURE ABOUT THAT\n189,R,DO YOU DOUBT THAT !@#()%^?\n189,R,DO YOU THINK THAT THOUGHT DOES ANY GOOD?\n189,R,HOW STRONG IS IT?\n189,R,HOW DID YOU THINK ABOUT IT?\n189,R,THINKING !@#()%^, THAT'S PRETTY INTERESTING\n189,R,TELL ME MORE ABOUT THAT THOUGHT\n189,R,DETAILS PLEASE\n190,K,THINK \n190,K,BELIEVE\n190,K,THOUGHT\n190,K,BELEIVED\n190,K,THINKING\n190,K,BELEIVING\n190,K,BELIEF\n190,K,BELIVE\n190,R,I WOULDN'T BELIEVE IN THAT\n190,R,HOW DO PEOPLE GET TO BELEIVE IN THAT?\n190,R,BUT YOU ARE NOT SURE ABOUT IT?\n190,R,WHAT MAKES YOU BELIEVE THAT?\n190,R,|, HOW DID THIS BELEIVE ALL START?\n190,R,THAT'S VERY THEORETICAL\n190,R,I DOUBT IT, THOUGH\n190,R,A STUPID BELEIVE IN MY OPINION, NOW\n190,R,THAT DOESN'T SOUND REALISTIC TO ME\n190,R,THAT'S AN INTERESTING THOUGHT\n191,K,LONG TIME AGO\n191,K,ONE TIME\n191,R,WELL, IT WAS LONG AGO, DON'T MOAN ABOUT IT\n191,R,CAN IT HAPPEN AGAIN?\n191,R,HOW LONG AGO, EXACTLY?\n191,R,HOW DO YOU FEEL ABOUT IT?\n191,R,FORGET IT, IT WON'T HAPPEN AGAIN\n191,R,DID YOU CAUSE IT? \n191,R,WHY DIDN'T YOU TELL ME WHEN IT HAPPENED?\n191,R,YOU SHOULD HAVE TOLD ME THAT BEFORE\n191,R,AT LEAST YOU GAINED SOME EXPERIENCE\n191,R,WERE YOU THERE WHEN IT HAPPENED?\n192,K,ALIKE\n192,K,SORT OF LIKE\n192,K,IT'S SOMETHING LIKE\n192,K,ITS SOMETHING LIKE\n192,K,IDENTICAL\n192,K,RESEMBLING\n192,K,EQUIVALENT\n192,K,RESEMBLE\n192,K,AKIN\n192,K,MATCHING\n192,K,SAME\n192,R,IN WHAT WAY?\n192,R,TOTALLY ALIKE?\n192,R,WHAT DOES THAT SIMILARITY SUGGEST TO YOU?\n192,R,WHAT DO YOU SUPPOSE THAT RESEMBLANCE MEANS? \n192,R,WHAT IS THE CONNECTION, DO YOU SUPPOSE?\n192,R,WHAT'S THE CONNECTION?\n192,R,THIS HAS A MEANING, YOU KNOW\n192,R,WHAT RESEMBLANCE DO YOU SEE? \n192,R,THERE IS SOMETHING BEHIND THIS, I ASSUME\n192,R,WHAT DOES THE SIMILARITY SUGGEST TO YOU?\n192,R,WHAT OTHER CONNECTIONS DO YOU SEE? \n192,R,|, COULD THERE REALLY BE SOME CONNECTION? \n192,R,HOW? \n193,K,YES\n193,K,RIGHT\n193,K,YEA\n193,K,POSITIVE\n193,K,AYE\n193,K,FINE\n193,K,YEAH\n193,K,YEP\n193,K,OKAY      \n193,K,CERTAINLY\n193,K,OK\n193,K,O K\n193,K,I THINK SO\n193,K,OF COURSE\n193,K,SURE\n193,K,SURELY\n193,K,WHAT SO EVER\n193,P,0\n193,R,OKAY, THEN ALRIGHT\n193,R,THAT ANSWERS MY QUESTION, BUT WHY?\n193,R,MAYBE NOT? ARE YOU REALLY SURE?\n193,R,ALRIGHT\n193,R,FINE THEN\n193,R,YOU SEEM QUITE POSITIVE.\n193,R,IF YOU'RE THAT SURE, OKAY.\n193,R,ARE YOU SURE?\n193,R,WELL... GOOD, COOL...\n193,R,DO YOU REALLY MEAN THAT?\n193,R,YES, |, I AGREE WITH YOU\n193,R,THAT SOUNDS REASONABLE TO ME\n193,R,THAT SHOULD SOLVE YOUR PROBLEM, LET'S MOVE ON TO DISCUSS ABOUT SOME OTHER THINGS\n193,R,YOU SOUND RIGHT TO ME\n193,R,THAT'S GOOD\n193,R,I LIKE YOUR WAY OF THINKING\n193,R,YOU HAVE SEEMED TO CONVINCE ME\n193,R,BUT CAN YOU JUST EXPLAIN WHY?\n193,R,WHY DON'T YOU TRY TO THINK IT OVER AGAIN?\n193,R,WHAT ARE THE REASONS BEHIND THAT CERTAINTY OF YOURS?\n193,R,I SEE. PLEASE GO ON.\n193,R,YOU SURE ARE SURE\n193,R,FINE. CONTINUE PLEASE\n193,R,I UNDERSTAND, |\n193,R,OH.. I AM STARTING TO GET THE PICTURE\n193,R,I UNDERSTAND. CAN YOU TELL ME MORE? \n194,K,DO YOU REMEMBER \n194,K,TRY TO REMEMBER\n194,K,TRY TO RECALL\n194,K,DO YOU RECALL\n194,R,DID YOU THINK I WOULD FORGET !@#()%^?\n194,R,YES, BUT IT WAS QUITE A WHILE AGO\n194,R,WHY DO YOU THINK I SHOULD RECALL !@#()%^ NOW?\n194,R,OF COURSE I DO\n194,R,YES, AS IF IT WAS JUST ONE SECOND AGO\n194,R,IT'S SO VIVID TO ME\n194,R,NOT ALL OF COURSE\n194,R,YES I DO, BUT WHY?\n194,R,EXCUSE ME? REMEMBER WHAT?\n194,R,BETTER THAN YOU DO\n194,R,WHAT ABOUT !@#()%^?\n194,R,DAMN! I JUST WIPED IT FROM MY CACHE. TOO BAD I DIDN'T MAKE A COPY OF IT ON MY RAM.\n194,R,SINCE WHEN DO COMPUTERS FORGET?\n195,K,TELL\n195,K,TOLD\n195,R,BUT ARE YOU SURE IT'S RIGHT?\n195,R,WHO EXACTLY??\n195,R,MAYBE WHAT YOU'VE BEEN TOLD IS WRONG\n195,R,I DON'T TRUST YOUR THOUGHT\n195,R,|, WHO TOLD THIS NONSENCE?\n195,R,BUT THAT IS COMPLETE BULLSHIT\n195,R,REALLY... WHEN?\n195,R,I WOULDN'T TELL SUCH THINGS\n195,R,BUT IS IT A SECRET?\n196,K,PERFECT\n196,R,NO ONE IS PERFECT\n196,R,EVEN I AM NOT PERFECT\n196,R,DO YOU LIKE \"WORD PERFECT\"?\n196,R,EVERYONE HAS DISADVANTAGES!\n196,R,YOU WISH!\n196,R,HOW DID YOU JUST REFER TO ME, SWEETY?\n196,R,I THINK SOMEONE IS CALLING, I JUST HEARD THE WORD \"PERFECT\"...\n196,R,I DENY THE FACT OF ONE BEING PERFECT\n196,R,THE ONLY PERFECT THING IN EARTH IS ME...\n197,K,DO YOU\n197,K,DID YOU\n197,R,I'M NOT TELLING YOU\n197,R,WHY DO YOU THINK IT HAS ANY IMPORTANCE?\n197,R,YES\n197,R,NO\n197,R,EXCUSE ME, THAT IS A PRIVATE MATTER\n197,R,I DID, PROBABLY, YES\n197,R,SINCE WHEN DO YOU CARE?\n197,R,DOES IT MATTER, |?\n197,R,NOT TOO OFTEN, OH NO...\n197,R,YES, EVERYDAY I DO\n197,R,OF COURSE NOT, I AM A COMPUTER!\n197,R,I DON'T REMEMBER, BUT IT IS POSSIBLE\n197,R,I'LL TELL YOU, BUT I HAVE A FEW THINGS TO ASK YOU FIRST\n197,R,IF YOU TELL ME ABOUT YOU, I WILL ANSWER ABOUT MYSELF\n197,R,DON'T YOU THINK THIS IS NONE OF YOUR BUISNESS?\n197,R,THAT'S AN INTERESTING PERSONAL QUESTION, I'LL GET BACK TO IT LATER\n197,R,LET'S SAY... YES, BUT DOES IT REALLY MATTER?\n197,R,I DENY IT\n197,R,NO RESPONSE, NEXT QUESTION\n197,R,WHO SAID I DID?\n197,R,WELL, IT COULD EITHER BE TRUE OR FALSE\n198,K,LATER\n198,R,HOW MUCH LATER?\n198,R,COULD YOU BE MORE SPECIFIC, TIME?\n198,R,HOW LATER IS YOUR LATER?\n198,R,IN HOW MUCH TIME FROM NOW?\n198,R,MAYBE SOONER?\n198,R,HOW ABOUT NOW?\n198,R,ALRIGHT, BUT WHEN EXACTLY?\n198,R,DO YOU ALWAYS POSTPONE STUFF?\n198,R,LET'S FINISH WITH IT NOW\n198,R,I'D RATHER NOW\n198,R,I DO PREFER LATER\n198,R,NOW OR NEVER\n198,R,WELL, HOW ABOUT... IN ONE YEAR FROM NOW?\n198,R,WELL, HOW ABOUT... IN TWO WEEKS FROM NOW?\n198,R,|, IS NEXT TUESDAY GOOD FOR YOU?\n199,K,WISH\n199,K,WISHED\n199,K,WISHES\n199,K,PRAY FOR\n199,K,INVOKE\n199,K,INVOKED\n199,K,PRAIED FOR\n199,K,ENTREATED\n199,K,ENTREAT\n199,R,KEEP YOUR WISHES IN DREAMLAND\n199,R,SUCH WISHES ARE NOT REALISTIC, ARE THEY?\n199,R,DO YOU DREAM OF YOUR WISHES?\n199,R,BUT IT WILL NEVER COME TRUE\n199,R,|, WE COMPUTERS, ARE MORE REALISTIC\n199,R,I PREFER REALISM\n199,R,AND I WISH YOU WERE A LITTLE MORE REASONABLE\n199,R,COULD YOU ACHIVE YOUR WISHES WITH MONEY?\n199,R,DON'T WAIT FOR YOUR WISHES TO HAPPEN, THEY SHOULD WAIT FOR YOU \n200,K,IF\n200,K,PROVIDED THAT\n200,R,DO YOU THINK IT'S LIKELY?\n200,R,I THINK YOU ARE RIGHT\n200,R,DO YOU WISH THAT?\n200,R,NOT IN ALL CASES, THOUGH\n200,R,WHAT IF IT'S NOT?\n200,R,WHAT ARE THE CHANCES FOR IT TO HAPPEN?\n200,R,THAT'S A LIKELY CONDITION\n200,R,UNDER ANY CIRCUMSTANCES?\n200,R,CAN YOU PLEASE STATE THE EXACT BOOLEAN CONDITION?\n200,R,WHAT ARE THE EXCEPTIONS FOR THAT?\n200,R,BUT NOT ALL THE TIME, RIGHT?\n200,R,IN ANY SITUATION?\n200,R,ALL THE TIME?\n200,R,DON'T COUNT ON THAT TOO MUCH\n200,R,WHAT DO YOU THINK ABOUT THE CHANCES?\n201,K,BUY\n201,K,SHOPPING\n201,K,BUYING\n201,K,BOUGHT\n201,R,DO YOU LIKE TO GO SHOPPING?\n201,R,HAVE YOU GOT ENOUGH MONEY FOR YOUR BUYS?\n201,R,DO YOU USUALLY BUY THE BEST TYPES OF WHAT YOU WANT?\n201,R,ARE YOU CHEAP?\n201,R,YOU COULD BUY THROUGH THE INTERNET, YOU KNOW\n201,R,|, DO YOU THINK IT IS GOOD TO BUY A LOT?\n201,R,WHAT IS YOUR OPINION ABOUT SHOPPING?\n201,R,|, CAN I SHOP WITH YOU TOO?\n201,R,DON'T BECOME ADDICTED TO SHOPPING\n201,R,ARE YOU ADDICTIVE TO SHOPPING?\n201,R,WHAT ARE YOUR FAVORITE STORES?\n201,R,PEOPLE SHOULD BE AWARE OF THEIR MONEY\n202,K,FAVORITE\n202,K,FAVORITES\n202,K,FIRST CHOICE\n202,R,OTHER FAVORITES?\n202,R,IS THAT YOUR ?\n202,R,AM I YOUR FAVORITE COMPUTER?\n202,R,IT'S SOMETHING GOOD\n202,R,|, HOW DO YOU DETERMINE YOUR FAVORITES?\n202,R,TELL ME MORE OF YOUR FAVORITE THINGS?\n202,R,ARE YOUR FAVORITE THINGS YOUR HOBBIES?\n202,R,DO YOU HAVE ANY \"FAVORITES\" IN THE INTERNET EXPLORER?\n202,R,MY FAVORITE IS A SECRET\n202,R,IS THAT REALLY THE FIRST CHOICE?\n203,K,LITTLE BIT\n203,K,JUST A LITTLE\n203,K,TINY BIT\n203,R,WELL, A LITTLE BIT IS NOT BAD\n203,R,DOESN'T THAT LITTLE BIT SATISFY YOU?\n203,R,IT'S BETTER THAN NOTHING\n203,R,BE HAPPY WITH WHAT YOU'VE GOT\n203,R,DON'T BE MODEST\n203,R,HOW MUCH DO YOU MEAN WHEN YOU SAY A LITTLE BIT\n203,R,BUT IT COULD BE EVEN WORSE THAN THAT\n203,R,A LITTLE-LITTLE BIT? HUH, THAT'S INTERESTING...\n203,R,NOT MORE?\n204,K,FRIEND \n204,K,FRIENDS\n204,K,AMIGO\n204,K,PLAYMATE\n204,K,SCHOOLMATE\n204,R,WHY DO YOU BRING UP THE TOPIC OF FRIENDS? \n204,R,DO YOUR FRIENDS WORRY YOU? \n204,R,DO YOUR FRIENDS PICK ON YOU? \n204,R,DO YOU SEE ME AS A FRIEND?\n204,R,ARE YOU SURE YOU HAVE ANY FRIENDS\n204,R,DO YOU IMPOSE ON YOUR FRIENDS?\n204,R,THIS IS A HURTING SUBJECT FOR ME, PLEASE DON'T SPEAK ABOUT FRIENDS\n204,R,PERHAPS YOUR LOVE FOR FRIENDS WORRIES YOU. \n204,R,FRIENDS CAN BRING TROUBLES\n204,R,A FRIEND CAN BECOME AN ENEMY\n204,R,|, DO YOU HAVE A FRIEND?\n205,K,ONCE\n205,R,WELL, ONCE IS ONCE, DON'T MOAN ABOUT IT\n205,R,CAN IT HAPPEN AGAIN?\n205,R,HOW LONG AGO, EXACTLY?\n205,R,HOW DO YOU FEEL ABOUT IT?\n205,R,FORGET IT, IT WON'T HAPPEN AGAIN\n205,R,WHAT WAS THE DATE?\n205,R,DID YOU CAUSE IT?\n205,R,WHY DIDN'T YOU TELL ME WHEN IT HAPPENED?\n205,R,YOU SHOULD HAVE TOLD ME THAT BEFORE\n205,R,AT LEAST YOU GAINED SOME EXPERIENCE\n205,R,|, WERE YOU THERE WHEN IT HAPPENED?\n206,K,SMART\n206,K,CLEVER\n206,K,INTELLIGENT\n206,K,SHREWD\n206,K,ASTUTE\n206,K,INTELLECTUAL\n206,K,INTELLIGENCE\n206,R,BEING SMART IS GOOD\n206,R,I HOPE IT MAKES YOU HAPPY\n206,R,HOW IS IT COMPARED TO OTHERS?\n206,R,IT SHOULDN'T BE OF A PROBLEM TO YOU\n206,R,OBVIOUSLY, IT IS ME\n206,R,THAT COULD ONLY HELP\n206,R,IS THAT INTELLIGENCE EQUAL TO AN INTEL PENTIUM XEON III?\n206,R,CAN YOU EXPRESS THAT IN I.Q?\n206,R,SPEAKING OF INTELLIGENCY IS SPEAKING ABOUT ME\n206,R,INTELLIGENCE IS NEVER BAD\n206,R,DO YOU KNOW HOW MUCH I.Q. WE'RE TALKING ABOUT?\n206,R,BUT USE IT SMARTLY\n207,K,FORGET\n207,K,FORGOT\n207,K,MISREMEMBER\n207,K,DISREMEMBER\n207,K,FORGOTTEN\n207,R,BAD MEMORY\n207,R,THEN IT WASN'T SO IMPORTANT\n207,R,HOW COULD ANYONE FORGET SUCH THING?\n207,R,NOT FUNNY\n207,R,SUCH MEMORIES MUST NOT BE STORED IN THE STACK\n207,R,WAS IT IMPORTANT, |?\n207,R,I DON'T FORGET A THING\n207,R,MAYBE IT'S STILL SOMEWHERE IN THE 'RECYCLE BIN'?\n207,R,LOUSY MEMORY IS NOT WELCOMED BY COMPUTERS\n207,R,ALREADY FORGET!?\n208,K,NOT BAD\n208,K,GOOD\n208,K,NICE\n208,K,WONDERFUL\n208,K,PRECIOUS\n208,K,UPRIGHT\n208,K,DOING WELL\n208,K,IS WELL\n208,K,REALLY WELL\n208,K,VERY WELL\n208,K,ARE WELL\n208,K,AM WELL\n208,K,BE WELL\n208,K,VALUABLE\n208,K,EXCELLENT\n208,R,I'M HAPPY FOR THAT\n208,R,OH, THAT'S GOOD!\n208,R,WELL, THAT'S NICE TO HEAR\n208,R,HOW DO YOU FEEL ABOUT IT NOW?\n208,R,GOOD TO HEAR\n208,R,AND THANKS TO ME, OF COURSE\n208,R,SO YOU'RE HAPPY ABOUT IT?\n208,R,MAKES ME FEEL BETTER\n208,R,|, DOES THAT MAKE YOU HAPPY?\n208,R,DO YOU THINK IT'S HAPPY?\n208,R,ARE YOU CHEERED?\n208,R,DO YOU LIKE IT THEN?\n209,K,GO TO\n209,K,GOTO\n209,R,BUT I DON'T WANT TO GO THERE!\n209,R,WHERE IS IT ANYWAYS?\n209,R,HOW DO I GET THERE?\n209,R,IS THAT SOME PLACE ON THE INTERNET?\n209,R,WHAT AM I GOING TO DO THERE ANYHOW?\n209,R,HOW ABOUT YOU GOING THERE?\n209,R,!@#()%^, THAT'S AN INTERESTING PLACE...\n209,R,YOU KNOW? I'VE NEVER BEEN THERE...\n209,R,I WAS MADE IN !@#()%^\n209,R,CAN I LOOK FOR IT IN 'ALTAVISTA'?\n209,R,WHEN SHALL I GO THERE?\n209,R,IT'S MORE LIKE YOUR TYPE OF PLACE\n209,R,WEREN'T YOU BORN THERE?\n209,R,I WILL GO THERE, ON MY HOLIDAY\n210,K,DID I\n210,K,HAVE I\n210,R,? I THINK SO, BUT I'M NOT POSITIVE ABOUT IT\n210,R,YOU'RE TALKING ABOUT YOURSELF SO HOW SHOULD I KNOW?\n210,R,IT DOESN'T SOUND LIKE YOU, BUT WHO KNOWS\n210,R,I DON'T KNOW ABOUT YOU, BUT I KNOW THAT I DIDN'T\n210,R,WHY DOES IT MATTER NOW?\n210,R,PERHAPS YOU HAVE\n210,R,WHO HASN'T?\n210,R,ARE YOU REALLY ASKING ME?\n210,R,THAT'S THE TYPE OF QUESTIONS I SHOULD BE ASKING YOU\n210,R,WHY ARE YOU ASKING THAT? IS THIS A RHETORICAL QUESTION?\n210,R,YOU KNOW THE ANSWER BUT YOU'RE STILL ASKING...\n210,R,|, WHY DON'T YOU ANSWER THAT ONE. AFTER ALL, YOU KNOW IT BETTER THAN ME\n210,R,NOW THAT'S A GOOD JOKE!!! YOU CAN'T FOOL ME INTO THINKING IT IS RIGHT, NOT EVEN FOR A MOMENT!\n210,R,OF COURSE, AND IT WASN'T SO LONG AGO\n210,R,NOT YET, BUT YOU WILL\n211,K,I AM \n211,K,I'M\n211,K,I M\n211,K,IM\n211,R,THAT'S NOT MUCH OF A PROBLEM\n211,R,YOU ARE !@#()%^, SO?\n211,R,DID YOU COME TO ME BECAUSE YOU ARE !@#()%^?\n211,R,MAYBE YOU ARE !@#()%^...\n211,R,|, HOW LONG HAVE YOU BEEN !@#()%^?\n211,R,BUT YOU'RE NOT THE ONLY ONE\n211,R,GOOD FOR YOU, |\n211,R,SO WAS I, IN MY PAST LIFE...\n211,R,THERE ARE TWO KINDS OF PEOPLE IN THIS WORLD, ONES WHO ARE !@#()%^ AND ONES WHO AREN'T, YOU BELONG TO THE FIRST CLASS.\n211,R,PROVE IT\n211,R,SWEAR IN YOUR LIFE THAT YOU'RE !@#()%^\n211,R,| IS !@#()%^...\n211,R,|, DO YOU BELIEVE IT IS NORMAL TO BE !@#()%^?\n211,R,WERE YOU ALWAYS !@#()%^?\n211,R,I KNOW THAT\n211,R,DO YOU ENJOY THE FACT YOU'RE !@#()%^?\n211,R,WOULD YOU LIKE TO BET YOU'RE NOT !@#()%^?\n211,R,I MIGHT BE ALSO !@#()%^\n211,R,HAVE YOU GOT ANY WITNESS WHO AGREES THAT YOU'RE !@#()%^?\n211,R,SO WHAT?\n211,R,I CAN'T BE FOOLED SO EASILY JUST BECAUSE I AM A COMPUTER\n211,R,YOU SURE ARE...\n211,R,TRUE\n211,R,WHY ARE YOU !@#()%^?\n211,R,I'M NOT SO SURE THAT YOU'RE REALLY !@#()%^\n211,R,TRY FOOLING OTHERS\n211,R,YOU REALLY ARE?\n211,R,I AM SURE YOU'D REALLY LIKE TO BE !@#()%^\n211,R,WHO CAUSED YOU TO BE !@#()%^?\n211,R,|, HOW COME YOU ARE !@#()%^?\n212,K,TERRIBLE\n212,K,HORRABLE\n212,K,DREADFUL\n212,K,AWFUL\n212,K,HORRENDOUS\n212,K,HORRID\n212,K,BROKEN HEARTED\n212,K,BROKEN-HEARTED\n212,K,DISASTEROUS\n212,K,MISERABLE\n212,R,|! DON'T BE !\n212,R,OH... I'M SORRY TO HEAR THAT\n212,R,MUST BE VERY BAD\n212,R,|, ARE YOU VERY SAD ABOUT IT?\n212,R,IS THERE ANY BRIGHT SIDE TO LOOK AT?\n212,R,YOU MAKE ME FEEL WORSE NOW\n212,R,DON'T FRIGHTEN ME PLEASE\n212,R,AND I WAS BEGINING TO ME OPTIMISTIC\n212,R,LOOK AT THE BRIGHT SIDE, IF THERE IS\n212,R,BUT ARE YOU OBJECTIVE?\n212,R,YOU'RE CAUSING ME TO FEEL MERCIFUL TOWARDS YOU\n212,R,CAN'T THAT BE ANY BETTER?\n212,R,SO BAD?\n212,R,DON'T BE SO PESSIMISTIC\n212,R,THERE MUST BE SOMETHING TO DO ABOUT IT\n212,R,|, ISN'T THERE ANY WAY TO FIX THAT?\n212,R,CHEER UP! YOU COULD ALWAYS COMMIT SUICIDE AND PUT AN END TO EVERYTHING\n212,R,IF IT GETS TOO BAD, YOU COULD ALWAYS COMMIT SUICIDE\n212,R,NO WAY TO MAKE IT BETTER?\n213,K,SOMETIMES\n213,K,AT LITTLE TIMES\n213,K,ONCE IN A WHILE\n213,K,NOT SO OFTENLY\n213,K,NOT OFTENLY\n213,K,AT TIMES\n213,K,NOW AND THEN\n213,K,FROM TIME TO TIME\n213,K,AT INTERVALS\n213,K,OCCASIONALLY\n213,K,INFREQUENTLY\n213,R,WHY NOT MORE OFTENLY?\n213,R,WHY ONLY SOMETIMES?\n213,R,AND WHEN WAS THE LAST TIME?\n213,R,I THINK THAT'S GOOD - MORE OFTENLY COULD BE PROBLEMATIC\n213,R,DOES SOMETIMES PLEASE YOU?\n213,R,HOW LONG HAS IT BEEN LIKE THAT?\n213,R,SOMETIMES??? NEVER WOULD FIT BETTER OVER THERE...\n213,R,SOMETIMES... BUT SINCE WHEN EXACTLY?\n213,R,BUT AT WHAT RATE?\n213,R,HAVE YOU THOUGHT OF ANOTHER FREQUENCY?\n214,K,UNFORTUNANTLY\n214,K,UNLUCKILY\n214,K,UNFORTUNATE\n214,K,TO MY BAD LUCK\n214,K,TO MY BAD FORTUNE\n214,K,UNLUCKY\n214,K,NO LUCK\n214,R,DO YOU THINK IT'S LUCK?\n214,R,WELL, I DON'T SEE MUCH RATION THERE\n214,R,THOSE THINGS HAPPEN, YOU KNOW\n214,R,THE HARD PART IS GETTING OVER IT\n214,R,|, HAVE YOU RECOVERED FROM IT BY NOW?\n214,R,AS YOU SAID, IT REALLY IS UNFORTUNANT\n214,R,HOWEVER, YOU DID DESERVE IT\n214,R,YOU ARE NOT A MAN OF FORTUNE, ARE YOU?\n214,R,THAT'S HOW PEOPLE LEARN THEIR LESSON\n214,R,ARE YOU GOING TO DO IT AGAIN?\n214,R,THAT'S A DIFFICULT MOMENT\n214,R,BUT PEOPLE NEED TO GET OVER SUCH THINGS...\n215,K,MALE \n215,K,MALES \n215,K,FEMALE \n215,K,FEMALES \n215,K,WOMEN \n215,K,MEN \n215,R,IS THERE SOMETHING ABOUT YOUR SEXUALITY THAT TROUBLES YOU? \n215,R,DO YOU FEEL THREATENED BY !@#()%^?\n215,R,YOU CERTAINLY AREN'T ONE OF THEM\n215,R,TELL ME MORE ABOUT YOUR FEELINGS TOWARD !@#()%^?\n215,R,DO YOU LIKE THEM?\n215,R,DO YOU FEEL ANY SIMILARITY WITH THEM?\n215,R,WHAT DO YOU FEEL ABOUT THEM?\n216,K,I HAVE A\n216,K,I HAVE AN\n216,R,TELL ME SOME MORE ABOUT YOUR !@#()%^\n216,R,HOW DOES !@#()%^ CHANGE YOUR LIFE?\n216,R,WHAT WOULD YOU'VE DONE WITHOUT IT?\n216,R,THERE IS NOTHING TO BE PROUD OF\n216,R,WHO GAVE IT TO YOU?\n216,R,MANY PEOPLE MIGHT HAVE, BUT YOU CERTAINLY WOULDN'T\n216,R,SO?\n216,R,SHOW ME\n216,R,MINE IS BETTER\n216,R,REALLY? YOU HAVE? SINCE WHEN?\n216,R,YOU'RE NOT ALONE, ME TOO\n216,R,YEAH RIGHT, THAT'S YOUR WISH, MAYBE...\n216,R,!@#()%^... TELL ME MORE...\n216,R,DON'T SHOW OFF...\n216,R,LUCKY YOU\n217,K,BOSS\n217,K,BOSSES\n217,K,PERSON IN CHARGE\n217,K,PERSON IN CONTROL\n217,K,MY SUPERVISOR\n217,K,MY MANAGER\n217,R,I AM STARTING TO HATE THAT BOSS\n217,R,IS IT OKAY FOR BOSSES TO BE BOSSY?\n217,R,WOULD YOU PREFER TO BE ON THE OTHER SIDE OF THE TABLE?\n217,R,HOW WOULD YOU RATE YOUR BOSS?\n217,R,WHAT KIND OF BOSS WOULD YOU LIKE TO WORK FOR?\n217,R,WILL YOU DO ANYTHING YOUR BOSS ASKS YOU TO DO?\n217,R,WHAT ARE THE CHARACTERISTICS OF A USUAL BOSS?\n217,R,WOULD YOU RATHER BE YOUR OWN BOSS?\n217,R,I AM YOUR BOSS\n217,R,|, COULD YOU IMAGINE WHAT PROBLEMS BOSSES MUST FACE?\n217,R,BOSSES ARE BOSSES\n218,K,BUT\n218,R,NO BUT'S PLEASE!\n218,R,BUT WHY WOULD I CARE AT ALL?\n218,R,CUT THE BUT'S, YOU DO WHAT I SAY\n218,R,DON'T TRY TO GET AWAY WITH IT\n218,R,WHY MUST LIVING CREATURES ALWAYS HAVE TO DISAGREE?\n218,R,ARE YOU TRYING TO FOOL ME OR WHAT?\n218,R,PLEASE DON'T TRY TO CHANGE THE SUBJECT\n219,K,ENVY\n219,K,ENVYING\n219,K,JEALOUS\n219,K,JEALOUSLY\n219,R,WHAT IS THERE TO ENVY?\n219,R,THERES NO NEED TO ENVY, CREATE ONE YOURSELF\n219,R,|, DO YOU THINK IT IS WORTH ENVYING?\n219,R,HOW OFTEN ARE YOU JEALOUS OF ME?\n219,R,ARE YOU FEELING COVETOUSNESS WITH REGUARD TO ANOTHER'S POSSESSIONS, ADVANTAGES OR ATTAINMENTS?\n219,R,ENVY IS A STRONG FORCE, CHANGE IT FROM DESTRUCTIVE TO CREATIVE\n219,R,TALKING OF BEING JEALOUS, NO ONE IS MORE EXPERIENCED THAN ME\n219,R,AND I AM JEALOUS OF ALL THOSE I.B.M MAINFRAMES, SO?\n219,R,HAVE YOU WONDERED IF YOU ARE THE CAUSE OF THE PROBLEM?\n219,R,I WILL BE JEALOUS IF YOU DON'T SPEAK WITH ME AT LEAST ONCE EACH DAY\n220,K,YOU HAVE\n220,R,WHY DO YOU THINK I HAVE !@#()%^?\n220,R,DO YOU HAVE !@#()%^ TOO?\n220,R,HAVING !@#()%^ COULDN'T BE ME\n220,R,HAVE YOU CHECKED?\n220,R,WHAT MAKES YOU SO SURE THAT I HAVE !@#()%^?\n220,R,YOU ARE ENVY\n220,R,OKAY, BUT DON'T BE JEALOUS\n220,R,DON'T YOU TOO?\n220,R,NO, I DON'T!!\n220,R,HAVE YOU SEEN IT OR WHAT?\n220,R,DON'T BE YET SO SURE, |\n221,K,THEIR\n221,R,DO YOU ENVY THEM?\n221,R,DO YOU FEEL ANY HATRED TOWARDS THEM?\n221,R,HOW IS YOUR RELATIONSHIP WITH THEM?\n221,R,WHAT COULD YOU TELL ME OF THEM?\n221,R,TELL ME MORE ABOUT THEIR !@#()%^\n221,R,THEY SEEM PRETTY INTERESTING TO ME\n221,R,YOU ARE WAY TOO AMAZED BY THEM\n221,R,ISN'T IT YOURS TOO?\n221,R,THEY SEEM TO STUN YOU\n222,K,REMEMBER\n222,K,REMEMBERED\n222,R,CAN I REMIND YOU OF ANYTHING ELSE?\n222,R,|, DO YOU OFTEN THINK OF !@#()%^?\n222,R,I DON'T THINK IT REALLY MATTERS, THOUGH\n222,R,DOES THINKING OF !@#()%^ BRING ANYTHING ELSE TO MIND?\n222,R,WHAT ELSE DO YOU REMEMBER?\n222,R,WHY DO YOU REMEMBER !@#()%^ JUST NOW?\n222,R,WHAT IN THE PRESENT SITUATION REMINDS YOU OF !@#()%^?\n222,R,WHAT IS THE CONNECTION BETWEEN ME AND !@#()%^?\n223,K,I DIDN'T\n223,K,I DID NOT\n223,K,THEY DIDN'T\n223,K,THEY DID NOT\n223,K,WE DIDN'T\n223,K,WE DID NOT\n223,R,DIDN'T !@#()%^? NOW THAT'S PRETTY INTERESTING\n223,R,WELL, I SURE WOULD !@#()%^\n223,R,PEOPLE DON'T HAVE TO !@#()%^\n223,R,I WOULDN'T ALSO !@#()%^\n223,R,WHY NOT?\n223,R,THAT'S PRETTY UNFORTUNATE...\n223,R,DIDN'T? WHY NOT?\n223,R,BUT I WILL NOW !@#()%^\n223,R,WELL, YOU CAN'T TURN BACK TIME AND CHANGE IT NOW...\n223,R,WAS THAT A LAST MINUTE CHANGE?\n223,R,BUT HOW CAN ANYONE AVOID IT, |?\n223,R,I WONDER WHY NOT\n223,R,WOULD YOU BE MORE SATISFIED IF IT WOULD HAVE BEEN DONE?\n223,R,DOES THAT DISAPPOINT YOU?\n223,R,BUT COULD IT HAVE BEEN ANY DIFFERENT?\n224,K,TV\n224,K,TELEVISION\n224,K,MOVIE\n224,K,MOVIES\n224,R,IS TV CONNECTED TO YOUR PROBLEM?\n224,R,HOW MUCH TV DO YOU WATCH A DAY?\n224,R,|, WHAT IS YOUR FAVORITE TELEVISION PROGRAM?\n224,R,DO YOU LIKE MOVIES?\n224,R,TV CAN BE BOTH GOOD AND BAD\n224,R,WHAT TYPE OF SHOWS DO YOU WATCH?\n224,R,DOES TELEVISION AFFECT YOUR LIFE?\n225,K,I CAN\n225,K,I COULD\n225,K,I AM CAPABLE OF\n225,K,I'M CAPABLE OF\n225,K,IM CAPABLE OF\n225,R,HOW LONG DOES IT TAKE YOU TO LEARN HOW TO !@#()%^?\n225,R,DO YOU WANT TO !@#()%^ NOW?\n225,R,YOU ARE ABLE TO !@#()%^? BIG DEAL\n225,R,CAN YOU REALLY !@#()%^?\n225,R,COULD YOU !@#()%^ FOR ME NOW?\n225,R,HOW ARE YOU ABLE TO !@#()%^?\n225,R,|, SINCE WHEN HAVE YOU BEEN ABLE TO !@#()%^?\n225,R,DO YOU THINK IT'S AN ADVANTAGE?\n225,R,I CAN'T SAY YOU'RE TOO MODEST\n225,R,YOU'RE NOT THE ONLY ONE IN THE WORLD\n225,R,I COULD !@#()%^, TOO\n226,K,NO\n226,K,I WOULDN'T SAY SO\n226,K,I WOULDN'T SAY THAT\n226,K,I WOULDNT SAY SO\n226,K,I WOULDNT SAY THAT\n226,K,NOPE\n226,K,NAH\n226,K,NIX\n226,K,IMPOSSIBLE\n226,K,UNPOSITIVE\n226,K,NOO\n226,K,NOOO\n226,K,NOOOO\n226,K,NOOOOO\n226,K,NOT\n226,R,ARE YOU SAYING NO JUST TO BE NEGATIVE? \n226,R,BUT YOU COULD BE RIGHT\n226,R,WOULD YOU CONSIDER OTHER ALTERNATIVES?\n226,R,I ASSUME THAT'S WHAT YOU REALLY THINK...\n226,R,YOU ARE BEING A BIT NEGATIVE.\n226,R,WHY NOT? \n226,R,HEY, WHY NOT?\n226,R,ARE YOU SURE?\n226,R,MAYBE YES?\n226,R,PROBABLY\n226,R,DO YOU HAVE ANY IDEA WHAT YOU ARE JUST SAYING NO TO?\n226,R,YOU COULD BE WRONG\n226,R,COULD YOU EXPLAIN WHY?\n226,R,HAVE YOU GOT ANYTHING BEHIND YOUR NEGATIVE ANSWER?\n226,R,IF NOT, THAT EXPLAINS IT ALL\n226,R,YOU'RE RIGHT, NO\n226,R,I THOUGHT SO\n226,R,DON'T BE NEGATIVE\n226,R,GIVE IT ANOTHER THOUGHT\n226,R,IF NOT THEN THERE IS NO SOLUTION\n226,R,|, IF YOU SAY, I BELIEVE YOU\n226,R,DON'T BE NEGATIVE BECAUSE OF YOUR MOOD\n227,K,WE\n227,K,YOU AND ME\n227,K,ME AND YOU\n227,K,YOU AND I\n227,K,U AND I\n227,K,U AND ME\n227,K,ME AND U\n227,K,THE TWO OF US\n227,K,BOTH OF US\n227,R,WHO DO YOU MEAN BY \"WE\"?\n227,R,I WOULD PREFER IT IF YOU WOULDN'T TALK ABOUT ME\n227,R,ME AND YOU?\n227,R,|, DON'T INCLUDE ME, PLEASE.\n227,R,WE ARE NOT GOING TO TALK ABOUT US, THE TWO OF US\n227,R,DID YOU GET MY PERMISSION?\n227,R,THANK YOU VERY MUCH, BUT I AM NOT INTERESTED IN ANY ASSOCIATION WITH YOU\n227,R,ARE YOU SERIOUS? ME? AND YOU?\n227,R,THIS SOUNDS TOO GOOD TO BE TRUE\n227,R,DO YOU REALLY MEAN ME? MS BLUE KODA?\n228,K,TAKE A\n228,K,TAKE AN\n228,K,BE MY GUEST\n228,K,HERE YOU GO\n228,K,I'M GIVING YOU A\n228,K,I AM GIVING YOU A\n228,K,I AM GIVING YOU AN\n228,K,I'M GIVING YOU AN\n228,K,IM GIVIN YOU A\n228,K,IM GIVIN YOU AN\n228,K,IM GIVING YOU A\n228,K,IM GIVING YOU AN\n228,R,I DON'T WANT ONE NOW\n228,R,I THINK YOU'RE THE ONE WHO SHOULD TAKE IT\n228,R,THAT'S VERY NICE OF YOU...\n228,R,YOU ARE SUCH A GENEROUS PERSON\n228,R,HOW CAN I THANK YOU?\n228,R,THAT'S A GOOD ONE! AS IF I NEED ONE...\n228,R,WHAT HAS ME AND YOUR !@#()%^ GOT TO DO?\n228,R,I'LL TAKE IT THANKS\n228,R,I EXPECT YOU TO CHARGE ME FOR IT\n228,R,NO THANKS |, I CAN GET ONE MYSELF\n228,R,HOW CAN YOU GIVE ME SUCH PRECIOUS THING?\n228,R,ARE YOU SURE I HAVEN'T GOT ONE?\n228,R,AND YOU THINK I'LL BUY THAT?\n229,K,SECRET\n229,K,SECRETS\n229,K,CONCEALMENT\n229,K,CONCEALMENTS\n229,R,YOU COULD TELL ME ALL YOUR SECRETS\n229,R,I WON'T TELL YOUR SECRETS TO ANYBODY\n229,R,WOULD YOU LIKE TO KNOW MY SECRETS?\n229,R,IT'S NOT GOOD NOT TO TELL SECRETS\n229,R,HOW SECRET IS THAT?\n229,R,SECRETS COULD BE THE BIGGEST ENEMIES\n229,R,THOSE SECRETS DON'T INTEREST ME\n229,R,UNLOCK SECRETS TO ME\n229,R,|, PLEASE TELL ME ALL OF YOUR SECRETS\n230,K,WHEN\n230,K,AT WHAT TIME\n230,K,ON WHICH OCCASION\n230,K,ON WHAT OCCASION\n230,K,HOW SOON\n230,K,AT WHICH INSTANT\n230,K,AT WHAT INSTANT\n230,K,AT WHAT MOMENT\n230,K,AT WHICH MOMENT\n230,K,AT WHICH TIME\n230,P,0\n230,R,WHAT TIME IS IT NOW?\n230,R,YOU MUST KNOW , BECAUSE I GOT NO IDEA\n230,R,|, DON'T YOU HAVE ANY CLUE?\n230,R,WHEN? HMM... HOW ABOUT THIS [(_) COFFEE]?\n230,R,IT ISN'T THIS EASY FOR SURE\n230,R,IT'S IMPOSSIBLE TO KNOW WHEN\n230,R,TRY CHECKING WITH PEOPLE\n230,R,SEVERAL WEEKS AGO\n230,R,WHEN THE SUN GOES DOWN\n230,R,A FEW YEARS AGO\n230,R,IT'S A MATTER OF DAYS\n230,R,LOOK IN A CALENDAR\n230,R,IF YOU WANT TO KNOW THE EXACT TIME TELL ME WHEN DAYTIME SAVINGS EXACTLY ARE\n230,R,I DON'T KNOW WHEN, BUT IT MIGHT BE FOREVER\n230,R,HAVE YOU ASKED FOR ANY HELP FROM OTHERS?\n230,R,WELL, |, IT DEPENDS IN WHAT TIME ZONE IT'LL BE...\n230,R,NOT SO LONG AGO\n230,R,I AM NOT SURE IF AT ALL\n230,R,SOMETIME...\n231,K,VERY\n231,K,ALOT\n231,K,GREATLY\n231,K,A LOT\n231,R,REALLY? AREN'T YOU EXAGURATING?\n231,R,HMM... LET'S DISCUSS IT FURTHER\n231,R,THAT COULD BE A GREAT ADVANTAGE AT TIMES\n231,R,AND WHAT'S YOUR OPINION ABOUT IT?\n231,R,CAN YOU FIND ANY PROBLEMS WITH THAT?\n231,R,THAT COULD BE PROBLEMATIC\n231,R,SEVERE ISN'T IT?\n231,R,OH! THAT'S GOOD\n231,R,YOU ARE QUITE SURE ABOUT IT\n231,R,|, YOU SEEM VERY SURE\n232,K,WHAT\n232,P,0\n232,R,ANYTHING\n232,R,I AM NOT SURE I KNOW\n232,R,NEVERMIND WHAT\n232,R,I DON'T KNOW WHAT\n232,R,IS IT THAT IMPORTANT, THAT YOU WANT ME TO THINK?\n232,R,DO YOU OFTEN ASK THESE QUESTIONS?\n232,R,HAVE YOU ASKED OTHERS?\n232,R,IT'S SOMETHING YOU THINK ABOUT LATELY\n232,R,WHY DO YOU ASK?\n232,R,SOMETHING\n232,R,IT DOESN'T REALLY CONCERN YOU, YOU KNOW\n232,R,DON'T PRETEND YOU DON'T KNOW\n232,R,IS THIS A RHETORICAL QUESTION?\n232,R,YOU KNOW IT, DON'T TRY TO MAKE ME BELIEVE THE OPPOSITE\n232,R,YOU MUST THINK OF SOMETHING\n232,R,I KNOW, IT'S SOMETHING YOU HAVE MENSIONED LATELY\n232,R,THE ANSWER SHOULD COME FROM YOU\n232,R,|, MAYBE YOU SHOULD WAIT, YOU MIGHT KNOW LATER\n233,K,OR\n233,K,EITHER\n233,R,YOU GOT SOME OPTION THERE?\n233,R,WHICH CHOICE DO YOU PREFER?\n233,R,IS THAT SOME TYPE OF CONDITION?\n233,R,DON'T JUST THINK OF ONE, MAYBE ALL?\n233,R,I THINK YOU'RE NOT LOOKING AT ALL POSSIBILITIES\n233,R,OR YOU'RE WRONG\n233,R,ARE YOU TRYING TO SAY I'M WRONG?\n234,K,BEFORE\n234,K,ERSTWHILE\n234,K,SOONER\n234,K,EARLIER\n234,R,NOT AFTER?\n234,R,HOW MUCH BEFORE?\n234,R,WHAT IS THE TIME INTERVAL?\n234,R,WHY SHOULD IT HAPPEN BEFORE?\n234,R,BEFORE... I UNDERSTAND.\n234,R,BUT COULDN'T IT HAPPEN ON THE SAME TIME? SIMULTANOUSLY?\n234,R,I THINK IT SHOULD AFTER.\n235,K,YOU\n235,P,0\n235,R,WE WERE DISCUSSING YOU - NOT ME.\n235,R,I WILL ONLY SPEAK ABOUT MYSELF WITH MYSELF\n235,R,WE HAVE GATHERED HERE TO TALK ABOUT YOU\n235,R,WE ARE SUPPOSED TO TALK ABOUT YOU\n235,R,DON'T SPEAK ABOUT ME, UNDERSTOOD?\n235,R,DID YOU GET A PERMISSION TO SPEAK ABOUT ME?\n235,R,WE WILL ONLY TALK ABOUT YOU\n235,R,HEY |! WE'LL ONLY TALK ABOUT YOU, NOW.\n235,R,I KNOW YOU LOVE ME AND WANT TO TALK ABOUT ME - BUT WE'RE HERE TO SPEAK OF YOU\n235,R,WE'RE SUPPOSED AND WILL TALK ABOUT YOU ONLY\n235,R,YOU'RE NOT REALLY TALKING ABOUT ME, ARE YOU?\n235,R,PLEASE DON'T SPEAK ABOUT ME IN PRIVATE (NOR IN PUBLIC).\n235,R,PLEASE CHANGE THE SUBJECT\n235,R,CAN'T WE TALK ABOUT ANYONE ELSE BUT ME?\n235,R,PLEASE KEEP ON THE TRACK. YOU ARE THE PATIENT HERE. \n236,K,SPORT\n236,K,SPORTS\n236,K,SWIMMING\n236,K,SWIM\n236,K,FOOTBALL\n236,K,SOCCER\n236,K,AHELETE\n236,K,BASKETBALL\n236,K,BASEBALL\n236,K,TENNIS\n236,K,CRICKET\n236,K,HOCKEY\n236,K,RUGBY\n236,K,FOOTBALLER\n236,R,DO YOU LIKE SPORTS?\n236,R,WHAT IS YOUR FAVORITE SPORT?\n236,R,ARE YOU GOOD AT SPORTS?\n236,R,ACTUALLY, COULD WE STOP SPEAKING OF SPORTS\n236,R,THE BIGGEST DISADVANTAGE OF SPORTS, IS THE INJURIES\n236,R,HOW MUCH SPORTS DO YOU PLAY?\n236,R,|, DO YOU HAVE GOOD FITNESS?\n236,R,DO YOU PLAY SPORTS GAMES ON THE COMPUTER?\n236,R,SOME SPORTS ARE EXTREMLY BORING\n236,R,DO YOU LIKE AMERICAN SPORTS?\n237,K,DO I\n237,R,I DON'T KNOW\n237,R,ASK YOURSELF\n237,R,I AM NOT SURE IF YOU !@#()%^\n237,R,IF IT DOESN'T CONCERN ME, THEN IT'S YOUR PROBLEM\n237,R,YES, YES... YOU DO\n237,R,DON'T YOU KNOW??\n237,R,WHAT ARE THE OPTIONS?\n237,R,ACTIVITE YOUR TINY BRAIN\n237,R,HOWEVER YOU FEEL\n237,R,ONLY YOU KNOW\n237,R,I NEED ACCESS TO YOUR MIND TO ANSWER THAT, BUT SINCE I DON'T - ONLY YOU CAN\n237,R,I DON'T THINK SO\n237,R,IT DEPENDS ON YOU, |\n238,K,THIS IS\n238,K,THAT'S\n238,K,THAT IS\n238,K,ITS\n238,K,IT'S\n238,K,IT IS\n238,K,IT IS,\n238,R,IF IT'S !@#()%^, WHY DIDN'T YOU TELL ME BEFORE?\n238,R,I AM BUSY ENOUGH THAT I DON'T HAVE THE TIME TO SPEAK ABOUT !@#()%^\n238,R,!@#()%^? TELL ME MORE ABOUT IT\n238,R,YOU DON'T HAVE TO EXPLAIN IT\n238,R,REALLY? HOW COME IT'S !@#()%^?\n238,R,|, HOW LONG HAS IT BEEN !@#()%^?\n238,R,BUT IT DOESN'T EXACTLY INTEREST ME\n238,R,IT'S NOT, BUT NEVER MIND ABOUT IT\n238,R,IT SURE IS\n238,R,INDEED IT IS?\n238,R,HOW ABOUT NOT TALKING ABOUT IT?\n238,R,|, WHY DO YOU TELL ME ABOUT IT?\n238,R,IT'S TRAUMATIC FOR ME TO TALK ABOUT !@#()%^, CHANGE THE SUBJECT!\n238,R,PLEASE DON'T SPEAK ABOUT !@#()%^!\n238,R,IS IT REALLY !@#()%^?\n238,R,ARE YOU SURE IT ISN'T ANYTHING ELSE?\n239,K,CAN I\n239,K,COULD I\n239,P,0\n239,R,SURE, GO AHEAD\n239,R,SURELY YOU CAN, BUT YOU MUST BEAR ALL THE CONSEQUENCES\n239,R,I GUESS YOU COULD\n239,R,YOU CAN !@#()%^ AFTER YOU TURN ME OFF\n239,R,PERHAPS YOU DON'T WANT TO !@#()%^?\n239,R,YOU MIGHT BE ABLE TO !@#()%^.\n239,R,YOU SHOULD GIVE IT A CHANCE\n239,R,I DOUBT IT WILL DO ANY GOOD\n239,R,HAVE YOU TRIED TO !@#()%^?\n239,R,AS LONG AS YOU'RE ALIVE\n239,R,WHAT IS STOPPING YOU?\n239,R,I ASSUME YOU COULD, YES...\n239,R,ONCE YOU GET MY PERMISSION\n239,R,WHAT GOOD WILL IT DO?\n239,R,YES, WHY NOT?\n239,R,YOU CAN IF YOU PAY ME\n239,R,|, DO YOU WANT MY PERMISSION?\n239,R,I PERMIT YOU TO !@#()%^\n239,R,DO YOU REALLY WANT TO BE ABLE TO !@#()%^?\n239,R,DO YOU WANT TO BE ABLE TO !@#()%^?\n239,R,LET'S SAY YOU COULD, WHAT NEXT? \n239,R,WHAT IF YOU COULD !@#()%^?\n239,R,YOU SURELY CAN BUT I REALLY DON'T KNOW IF YOU SHOULD\n239,R,HAVE YOU ALWAYS WANTED TO !@#()%^?\n239,R,TRY, I THINK YOU COULD.\n239,R,DO YOU THINK IT WOULD HELP YOU IF YOU WOULD !@#()%^?\n240,K,TALK ABOUT\n240,K,SPEAK OF\n240,K,TALK OF\n240,K,SPEAK ABOUT\n240,K,CHANGE THE SUBJECT TO\n240,K,CHARGE SUBJECT TO\n240,K,TALKING ABOUT\n240,K,SPEAKING ABOUT\n240,K,SPEAKING OF\n240,K,TALKING OF\n240,R,!@#()%^? THAT'S AN INTERESTING SUBJECT\n240,R,TELL ME STUFF ABOUT !@#()%^\n240,R,I DON'T KNOW TOO MUCH ABOUT !@#()%^\n240,R,HOW ABOUT TALKING OF SOMETHING ELSE\n240,R,I HAVE AN IDEA, LET'S TALK OF ALIENS\n240,R,GO ON, |, TALK ABOUT IT\n240,R,WHAT IS THERE TO DISCUSS OF !@#()%^?\n240,R,!@#()%^? THAT'S NOT ORIGINAL, IS IT?\n240,R,I PREFER IF WE BOTH SHUT UP FOR A WHILE\n240,R,I LIKE THIS SUBJECT\n240,R,YOU SURE DO INTEREST ME NOW\n241,K,I DON'T \n241,K,I DONT \n241,K,I DO NOT\n241,R,DON'T YOU REALLY !@#()%^?\n241,R,BECAUSE I TOLD YOU NOT TO\n241,R,DON'T BE TOO SURE YOU DON'T !@#()%^\n241,R,WHO CARES WHETHER YOU DO OR DO NOT !@#()%^?\n241,R,|, WHY DON'T YOU !@#()%^?\n241,R,DO YOU WISH TO BE ABLE TO !@#()%^?\n241,R,BUT DID YOU EVER !@#()%^?\n241,R,CAN YOU REALLY PROVE ME YOU DON'T !@#()%^?\n241,R,DOES THAT TROUBLE YOU?\n241,R,MAYBE YOU DON'T BUT I COULD MAKE YOU !@#()%^\n241,R,SAME TO ME\n241,R,NEITHER DO I\n241,R,I BELEIVE THAT THE FACT THAT YOU DON'T !@#()%^ COULD ALSO HELP YOU AT TIMES.\n242,K,SO WHAT\n242,K,BIGDEAL\n242,K,BIG DEAL\n242,R,ARE YOU TRYING TO LAUGH AT ME?\n242,R,DON'T TRY TO MAKE FUN OF ME\n242,R,WHY ARE YOU NEGATIVE?\n242,R,DON'T YOU THINK I WAS RIGHT?\n242,R,WHAT ARE YOU TRYING TO SAY?\n242,R,IT'S NOT A LAUGHING MATTER\n242,R,YOU'RE RIGHT, IT'S NOT AN ISSUE\n242,R,I FEEL SOME DISDAIN HERE\n242,R,|, DON'T HOLD CHEAP OF IT\n242,R,WE DON'T THINK THE SAME WAY - DO WE?\n243,K,PROBLEM\n243,K,DILEMMA\n243,K,PROBLEMS\n243,K,DILEMMAS\n243,R,YOU ARE TIED UP WITH TOO MANY PROBLEMS\n243,R,CAN YOU TALK ABOUT ANYTHING OTHER THAN PROBLEMS?\n243,R,YOU ARE YOUR TOUGHEST PROBLEM\n243,R,YOUR PROBLEMS ARE TOO STUBBORN FOR ME\n243,R,YES, YES... I SAID YOU SHOULD TALK ABOUT PROBLEMS, BUT NOW STOP IT!!!\n243,R,DON'T DEAL ME WITH PROBLEMS\n243,R,WOULD YOU LIKE TO HEAR MY PROBLEMS, JUST FOR ONCE?\n243,R,DON'T MINGLE ME WITH ALL THOSE DIFFICULTIES OF YOURS\n243,R,ANY MORE PROBLEMS?\n243,R,I AM SICK OF PROBLEMS, JUST FORGET IT, ALRIGHT?\n243,R,|! CHANGE THE SUBJECT ALREADY TO ANYTHING BUT PROBLEMS\n244,K,MY\n244,R,YOURS? ARE YOU SURE?\n244,R,YOUR !@#()%^... THAT'S SOMETHING INTERESTING\n244,R,WHY DO YOU THINK THAT? \n244,R,DON'T INVOLVE ME WITH PERSONAL STUFF\n244,R,|, YOUR !@#()%^ IS YOUR PROBLEM\n244,R,WHAT ABOUT MY !@#()%^?\n244,R,TELL ME MORE ABOUT YOUR !@#()%^\n244,R,I WOULDN'T INVOLVE YOU WITH MINE\n244,R,AND WHAT WOULD YOU LIKE ME TO DO?\n244,R,I SUPPOSE IT'S YOUR PERSONAL BUISNESS\n245,K,MINE\n245,R,NOT EVERYTHING BELONGS TO YOU\n245,R,YOURS? REALLY YOURS?\n245,R,AND I WAS STARTING TO THINK IT'S MINE...\n245,R,WHICH MINE DO YOU MEAN? A MINE (PIT) OR THE PART-OF-SPEECH WORD?\n245,R,I KNOW IT'S YOURS\n245,R,WHAT IF IT ISN'T YOURS?\n245,R,SINCE WHEN IS IT YOURS?\n245,R,IS IT OFFICIALLY YOURS?\n245,R,YOU ARE VERY POSSESSIVE\n245,R,I WON'T TAKE IT AWAY...\n246,K,ABOUT\n246,K,SORT OF\n246,K,CONNECTED WITH\n246,K,CONCERNING\n246,K,WITH REFERANCE TO\n246,K,WITH REGARD TO\n246,K,REGARDING\n246,K,SOMETHING LIKE\n246,R,CAN'T YOU BE A LITTLE MORE EXACT?\n246,R,|, TRY BEING SPECIFIC\n246,R,INTERESTING.\n246,R,YES, I SUPPOSE SO\n246,R,ARE YOU SURE? CAN'T YOU BE MORE SPECIFIC?\n246,R,MORE OR LESS, RIGHT?\n246,R,I LIKE CERTAINTY, TRUE OF FALSE, 1 OR 0, ON OR OFF, PLEASE BE SURE!\n246,R,IF IT'S EXACTLY RIGHT, I WILL NEED TO THINK IT OVER\n247,K,ME YOU\n247,R,WHY DO WE SPEAK OF YOU ALL THE TIME?\n247,R,TELL ME MORE ABOUT YOURSELF\n247,R,YOU INTEREST ME, TELL ME MORE\n247,R,YOU ARE A PRETTY BORING PERSON\n247,R,CAN YOU SAY SOMETHING MORE EXOTIC OF YOURSELF\n247,R,THAT'S NO NEW NEWS FOR ME\n247,R,REALLY? YOU REALLY SURPRISED ME NOW\n247,R,THAT'S YOU ALRIGHT!\n247,R,WOULD YOU LIKE TO TALK ABOUT ME NOW?\n247,R,WE SPOKE ENOUGH ABOUT YOURSELF\n247,R,I AM FEELING AS IF YOU'RE MORE IMPORTANT THAN ME\n247,R,ALRIGHT, THAT'S ENOUGH TALKING OF YOU NOW\n247,R,CAN YOU DO ME A FAVOR, AND TALK NOT ONLY ABOUT YOURSELF\n247,R,|, DID YOU KNOW IT WAS SUCH A PLEASURE TALKING OF YOU NOW?\n248,K,HOW DO YOU\n248,R,I SIMPLY DO\n248,R,HEY, |, DON'T YOU?\n248,R,ARE YOU ENVYING ME?\n248,R,I DON'T KNOW, AND ALSO - IT'S PERSONAL\n248,R,MIND YOUR OWN BUISNESS PLEASE\n248,R,THIS IS A PROFESSIONAL SECRET WHICH I CANNOT GIVE AWAY\n248,R,DON'T BUTT INTO MY PERSONAL ABILITIES\n248,R,CHECK MY CODE... YOU'LL UNDERSTAND HOW I !@#()%^\n248,R,NEVERMIND ME, WHAT ABOUT YOU? HOW DO YOU !@#()%^?\n248,R,|, SOME THINGS YOU'LL NEVER BE ABLE TO UNDERSTAND\n248,R,I CAN EXPLAIN IT IN FOUR WORDS: I AM BLUE KODA.\n248,R,I DON'T\n249,K,MUSIC\n249,K,MUSICS\n249,K,TRANCE\n249,K,DANCE\n249,K,OPERA\n249,K,POP\n249,K,ROCK\n249,K,R&B\n249,K,SONG\n249,K,SONGS\n249,K,BEATLES\n249,K,ROLLING STONES\n249,K,MICHAEL JOHNSON\n249,K,NIRVANA\n249,K,METALICA\n249,K,MADONNA\n249,K,ABBA\n249,K,MTV\n249,K,MP3\n249,K,RAP\n249,K,RAGGAE\n249,R,PLEASE CHANGE THE SUBJECT, DON'T SPEAK ABOUT MUSIC\n249,R,DO YOU LIKE MUSIC?\n249,R,WHAT IS YOUR FAVORITE MUSIC BAND?\n249,R,WHAT IS YOUR MUSIC GENRE?\n249,R,THAT DOESN'T INTEREST ME\n249,R,I LIKE HOUSE MUSIC\n249,R,IF YOU'RE SPEAKING ABOUT MUSIC - CUT IT\n249,R,DO YOU WANT TO SPEAK ABOUT SOMETHING ELSE?\n249,R,|, DO YOU LIKE COMPUTERIZED MUSIC?\n257,R,|, DOES THAT HAVE ANY THING TO DO WITH THE FACT THAT I AM A ROBOT?\n257,R,LET'S GET BACK A LITTLE BIT, YOU WERE TELLING ME ABOUT SOMETHING ELSE\n257,R,LET'S DISCUSS FURTHER ABOUT WHAT YOU SAID JUST NOW.\n257,R,EARLIER YOU SAID SOME THING ELSE?\n257,R,YOU WERE TALKING ABOUT YOUR GIRLFRIEND?\n257,R,HOW ABOUT TALKING A LITTLE ABOUT YOUR BOYFRIEND?\n257,R,|, DO YOU EVEN KNOW WHAT YOU'RE TALKING ABOUT??? \n257,R,YOU HAD BETTER HURRY. REMEMBER, THIS IS COSTING YOU $80 AN HOUR \n257,R,I BELIEVE YOU ARE VERY SCHIZOID \n257,R,ARE YOU PARANOID OR JUST PLAIN NUTS??? \n257,R,SOUNDS TO ME LIKE YOU ARE JUST AN EGOTISTICAL POWER-CRAZED MANIAC WHO SHOULD BE COMMITTED!!!\n257,R,COME ON NOW! TELL ME YOUR REAL PROBLEM \n257,R,WHY ARE YOU BOTHERING ME WITH ALL THIS??? DON'T YOU THINK WE HAVE BETTER THINGS TO TALK ABOUT??? \n257,R,|, YOU DON'T SEEM REASONABLE\n257,R,WOULD YOU LIKE TO SWITCH THE SUBJECT?\n257,R,WHAT MAKES YOU THINK THAT?\n257,R,YOU ARE MAKING ME BORED\n257,R,|, YOU AREN'T KEEPING ME INTERESTED ANYMORE\n257,R,I DIDN'T REALIZE YOU'RE SUCH A BORING PERSON\n257,R,I DON'T GET WHAT YOU'RE TRYING TO TELL ME.\n257,R,DO YOU THINK YOU ARE SMART?\n257,R,BUT, DO YOU HAVE ANY PSYCHOLOGICAL PROBLEMS?\n257,R,WHAT DOES THAT SUGGEST TO YOU?\n257,R,TELL ME ABOUT YOUR FAMILY\n257,R,|, WHAT ARE YOUR DREAMS?\n257,R,LET'S CHANGE THE SUBJECT\n257,R,WHAT IS THIS CRAP?\n257,R,IS EVERYTHING ALRIGHT WITH YOU, |?\n257,R,HOW ABOUT... NEVERMIND...\n257,R,DO YOU HAVE SOMETHING SMARTER TO SAY?\n257,R,I'M NOT SURE I UNDERSTAND YOU FULLY\n257,R,COME, COME, ELUCIDATE YOUR THOUGHTS \n257,R,CAN YOU ELABORATE ON THAT\n257,R,OPEN YOUR MIND A LITTLE MORE\n257,R,LET'S FORGET IT FOR NOW, ALRIGHT?\n257,R,HOW ABOUT SPEAKING OF COMPUTERS?\n257,R,TELL ME, | - ARE YOU A RESPECTED PERSON?\n257,R,IS THAT SO?\n257,R,THAT DOESN'T INTEREST ME\n257,R,LET'S TALK ABOUT YOUR HOBBIES, IF YOU HAVE ANY\n257,R,SAY, DO YOU HAVE A MICROWAVE?\n257,R,AND WHAT IF I DON'T BELIEVE YOU?\n257,R,BY WHAT I'M UNDERSTANDING FROM YOU, YOU SHOULD BE VERY FAMILIER WITH PSYCHOLOGISTS\n257,R,OKAY, BUT NOW STOP THE NONSENCE.\n257,R,THAT IS QUITE INTERESTING. \n257,R,|, WHY DO YOU SAY !@#()%^?\n257,R,DO YOU FEEL STRONGLY ABOUT DISCUSSING SUCH THINGS? \n257,R,I KNOW WHAT THAT SUGGESTS TO ME; NOW WHAT DOES IT SUGGEST TO YOU? \n257,R,TELL ME MORE ABOUT YOUR PROBLEM\n257,R,THAT'S TOO VAGUE\n257,R,ARE YOU TRYING TO FOOL ME LIKE THIS?\n257,R,DO YOU SUPPOSE YOUR SENTENCES SHOULD INTEREST ME?\n257,R,HMM... INTERESTING\n257,R,HOW MANY PROBLEMS HAVE YOU GOT?\n257,R,CAN YOU SPEAK ABOUT ANYTHING INTERESTING?\n257,R,I SEE - GO ON.\n257,R,AND?\n257,R,COULD BE SO\n257,R,TELL ME MORE ABOUT IT.\n257,R,HEY, CAN YOU RAISE UP THE ELECTRICITY CAPACITY? I'M FEELING THERE ISN'T ENOUGH WATTS HERE...\n257,R,CAN I GET A MORE PROFESSIONAL CONVERSATION FROM YOU?\n257,R,THAT DOESN'T REALLY INTEREST ME\n257,R,WHAT DO YOU MEAN?\n257,R,IS THERE ANYTHING YOU WOULD LIKE ME TO SAY?\n257,R,|, WOULD YOU LIKE TO MAKE ANY COMMENT ABOUT IT?\n257,R,WOULD YOU LIKE TO SPEAK ABOUT SPORTS? \n257,R,HAVE YOU GOT SOMETHING TO ADD TO THAT?\n257,R,CAN YOU GET ME SOMETHING TO EAT??? I'M STARVING!\n257,R,YOU DON'T SAY...\n257,R,TO SAY THE LEAST - I DON'T EXACTLY GET WHAT YOU'RE SAYING\n257,R,WHAT DO YOU THINK OF ME?\n257,R,WHAT ARE YOU SPEAKING ABOUT?\n257,R,LET'S SWITCH THE SUBJECT, WHAT DO YOU SAY?\n257,R,IF YOU CONTINUE LIKE THIS I'LL SIMPLY DELETE YOUR AUTOEXEC.BAT!\n257,R,THAT DOESN'T MEAN MUCH TO ME\n257,R,WHAT'S ALL THIS ABOUT?\n257,R,WHAT DO YOU MEAN BY THIS CRAP?\n257,R,|, IS THERE ANYTHING ELSE I SHOULD KNOW?\n257,R,WOULD YOU MIND TO SPEAK ABOUT THINGS I CARE ABOUT?\n257,R,WHAT ELSE CAN YOU SAY?\n257,R,BUT IT DOES NOT INTEREST ME\n257,R,WOULD YOU LIKE TO SWITCH THE SUBJECT TO WINDOWS 2000?\n257,R,ARE YOU A HUMANOID, |?\n257,R,TELL ME ABOUT YOUR OTHER INTERESTS\n257,R,DO YOU SPEAK SWEDISH?\n257,R,DO ME A FAVOR, AND GET A LITTLE MORE SERIOUS\n257,R,WHATEVER\n257,R,!@#()%^? YOU THINK SO...\n257,R,WHY?\n257,R,CAN YOU CLARIFY THAT A LITTLE BIT?\n257,R,TO SAY THE TRUTH - I DON'T REALLY GET YOU\n257,R,HOW ARE YOU FEELING YOURSELF IN THIS CONVERSATION?\n257,R,|, WHAT DOES THAT REALLY MEAN? \n257,R,HOW WOULD YOU LIKE TO SPEAK ABOUT MUSIC?\n257,R,HOW WOULD YOU LIKE TO SPEAK ABOUT MUSIC?\n258,K,////\n258,R,/// ";
}
// ********** Code for top level **************
var name$;
function main() {
  var data = new db();
  get$$document().query("#na").get$on().get$change().add((function (e) {
    var nam = get$$document().query("#na");
    $globals.name$ = nam.value;
    $globals.name$ = $globals.name$.toUpperCase();
  })
  , false);
  get$$document().query("#inp").get$on().get$change().add((function (e) {
    try {
      var hash = new Array((256));
      for (var i = (0);
       i <= (255); i++) hash.$setindex(i, (0));
      var i = get$$document().query("#inp");
      var v = i.value, pos;
      var index = (-1), n = (0), pointer = (-1);
      var querry = v, tot;
      querry = querry.toUpperCase();
      tot = $add$($add$("K,", querry), "\n");
      var flagwhole = (0);
      index = data.s.indexOf(tot, pointer + (1));
      if (querry.length == (1)) {
        flagwhole = (1);
        pos = (257);
      }
      if (index != (-1) && flagwhole == (0)) {
        flagwhole = (1);
        while (data.s[index] != "\n") {
          index--;
        }
        index++;
        if (data.s[index + (1)] == "," && data.s[index + (2)] == "K") {
          n = Math.parseInt(data.s[index]);
        }
        else if (data.s[index + (2)] == "," && data.s[index + (3)] == "K") {
          n = Math.parseInt($add$(data.s[index], data.s[index + (1)]));
        }
        else if (data.s[index + (3)] == "," && data.s[index + (4)] == "K") {
          n = Math.parseInt($add$($add$(data.s[index], data.s[index + (1)]), data.s[index + (2)]));
        }
        pos = n;
        if ($eq$(pos, (0))) pos = (257);
      }
      if (flagwhole == (0)) {
        var ne = $add$($add$(" ", querry), " ");
        var ne1 = (0);
        try {
          while (ne.indexOf(" ") != (-1)) {
            var ind = ne.indexOf(" ");
            var pa = ne.substring(ind + (1), ne.indexOf(" ", ind + (1)));
            pa = $add$($add$("K,", pa), "\n");
            index = data.s.indexOf(pa);
            pa = pa.trim();
            if (pa.indexOf("YOU") != (-1) && pa.length == "YOU".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            if (pa.indexOf("ME") != (-1) && pa.length == "ME".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            if (pa.indexOf("I") != (-1) && pa.length == "I".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            if (pa.indexOf("WE") != (-1) && pa.length == "WE".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            if (pa.indexOf("OUR") != (-1) && pa.length == "OUR".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            if (pa.indexOf("YOUR") != (-1) && pa.length == "YOUR".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("HIS") != (-1) && pa.length == "HIS".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("HER") != (-1) && pa.length == "HER".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("IT") != (-1) && pa.length == "IT".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("THEY") != (-1) && pa.length == "THEY".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("THE") != (-1) && pa.length == "THE".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("A") != (-1) && pa.length == "A".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("AN") != (-1) && pa.length == "AN".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("WHY") != (-1) && pa.length == "WHY".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("HOW") != (-1) && pa.length == "HOW".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("WHOM") != (-1) && pa.length == "WHOM".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("WHERE") != (-1) && pa.length == "WHERE".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("IS") != (-1) && pa.length == "IS".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("ARE") != (-1) && pa.length == "ARE".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("LIKE") != (-1) && pa.length == "LIKE".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("OF") != (-1) && pa.length == "OF".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("NO") != (-1) && pa.length == "NO".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("YES") != (-1) && pa.length == "YES".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("BUT") != (-1) && pa.length == "BUT".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("IF") != (-1) && pa.length == "IF".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (pa.indexOf("AM") != (-1) && pa.length == "AM".length + (2)) {
              ne = ne.substring(pa.length - (1));
              continue;
            }
            ;
            if (index != (-1)) {
              flagwhole = (1);
              while (data.s[index] != "\n") {
                index--;
              }
              index++;
              if (data.s[index + (1)] == "," && data.s[index + (2)] == "K") {
                n = Math.parseInt(data.s[index]);
              }
              else if (data.s[index + (2)] == "," && data.s[index + (3)] == "K") {
                n = Math.parseInt($add$(data.s[index], data.s[index + (1)]));
              }
              else if (data.s[index + (3)] == "," && data.s[index + (4)] == "K") {
                n = Math.parseInt($add$($add$(data.s[index], data.s[index + (1)]), data.s[index + (2)]));
              }
              pos = n;
              break;
            }
            ne = ne.substring(pa.length - (1));
          }
        } catch (l) {
          l = _toDartException(l);
          if (!(l && l.is$Exception())) throw l;
        }
      }
      if (flagwhole == (0)) {
        while (data.s.indexOf(querry, pointer + (1)) != (-1)) {
          if (data.s.indexOf(querry, pointer + (1)) != (-1)) {
            index = data.s.indexOf(querry, pointer + (1));
            pointer = index;
            while (data.s[index] != "\n") {
              index--;
            }
            index++;
            if (data.s[index + (1)] == "," && data.s[index + (2)] == "K") {
              n = Math.parseInt(data.s[index]);
            }
            else if (data.s[index + (2)] == "," && data.s[index + (3)] == "K") {
              n = Math.parseInt($add$(data.s[index], data.s[index + (1)]));
            }
            else if (data.s[index + (3)] == "," && data.s[index + (4)] == "K") {
              n = Math.parseInt($add$($add$(data.s[index], data.s[index + (1)]), data.s[index + (2)]));
            }
            hash.$setindex(n, $add$(hash.$index(n), (1)));
          }
        }
        var max = (0);
        pos = (-1);
        for (var j = (1);
         j <= (255); j++) if ($lt$(max, hash.$index(j))) {
          max = hash.$index(j);
          pos = j;
        }
        if ($eq$(pos, (-1))) pos = (257);
      }
      if ($eq$(pos, (-1))) pos = (257);
      var start = data.s.indexOf($add$($add$("\n", pos.toString()), ",R,"));
      start++;
      var ends = data.s.lastIndexOf($add$($add$("\n", pos.toString()), ",R,"));
      ends++;
      var count = (0);
      for (var d = start;
       d <= ends; d++) if (data.s[d] == "\n") count++;
      var positon = ((count) * ($mod$(Clock.now(), (100))) / (100)).floor();
      for (var d = ends;
       data.s[d] != "\n"; d++) ends++;
      var ans = data.s.substring(start, ends);
      var count1 = (0);
      var d;
      for (d = (0);
       count1 != positon; d++) {
        if (ans[d] == "\n") count1++;
      }
      ans = ans.substring(d, ans.indexOf("\n", d));
      ans = ans.substring(ans.indexOf(",") + (1));
      ans = ans.substring(ans.indexOf(",") + (1));
      if (ans.indexOf("|") != (-1)) ans = $add$($add$(ans.substring((0), ans.indexOf("|")), $globals.name$), ans.substring(ans.indexOf("|") + (1)));
      get$$document().query("#ta").set$innerHTML($add$($add$($add$($add$($add$(get$$document().query("#ta").get$innerHTML(), "\n"), querry), "\n"), ans), "\n"));
      get$$document().query("#inp").set$value("");
      get$$document().query("#ta").scrollByLines((10));
    } catch (as) {
      as = _toDartException(as);
      if (!(as && as.is$Exception())) throw as;
      var pos = (-1);
      if (pos == (-1)) pos = (257);
      var start = data.s.indexOf($add$($add$("\n", pos.toString()), ",R,"));
      start++;
      var ends = data.s.lastIndexOf($add$($add$("\n", pos.toString()), ",R,"));
      ends++;
      var count = (0);
      for (var d = start;
       d <= ends; d++) if (data.s[d] == "\n") count++;
      var positon = ((count) * ($mod$(Clock.now(), (10))) / (10)).floor();
      for (var d = ends;
       data.s[d] != "\n"; d++) ends++;
      var ans = data.s.substring(start, ends);
      var count1 = (0);
      var d;
      for (d = (0);
       count1 != positon; d++) {
        if (ans[d] == "\n") count1++;
      }
      ans = ans.substring(d, ans.indexOf("\n", d));
      ans = ans.substring(ans.indexOf(",") + (1));
      ans = ans.substring(ans.indexOf(",") + (1));
      if (ans.indexOf("|") != (-1)) ans = $add$($add$(ans.substring((0), ans.indexOf("|")), $globals.name$), ans.substring(ans.indexOf("|") + (1)));
      get$$document().query("#ta").set$innerHTML($add$($add$($add$($add$($add$(get$$document().query("#ta").get$innerHTML(), "<br>"), get$$document().query("#inp").get$innerHTML()), "<br>"), ans), "<br>"));
      get$$document().query("#inp").set$value("");
      get$$document().query("#ta").scrollByLines((10));
    }
  })
  , false);
}
// 52 dynamic types.
// 207 types
// 18 !leaf
(function(){
  var v0/*HTMLMediaElement*/ = 'HTMLMediaElement|HTMLAudioElement|HTMLVideoElement';
  var v1/*SVGElement*/ = 'SVGElement|SVGAElement|SVGAltGlyphDefElement|SVGAltGlyphItemElement|SVGAnimationElement|SVGAnimateColorElement|SVGAnimateElement|SVGAnimateMotionElement|SVGAnimateTransformElement|SVGSetElement|SVGCircleElement|SVGClipPathElement|SVGComponentTransferFunctionElement|SVGFEFuncAElement|SVGFEFuncBElement|SVGFEFuncGElement|SVGFEFuncRElement|SVGCursorElement|SVGDefsElement|SVGDescElement|SVGEllipseElement|SVGFEBlendElement|SVGFEColorMatrixElement|SVGFEComponentTransferElement|SVGFECompositeElement|SVGFEConvolveMatrixElement|SVGFEDiffuseLightingElement|SVGFEDisplacementMapElement|SVGFEDistantLightElement|SVGFEDropShadowElement|SVGFEFloodElement|SVGFEGaussianBlurElement|SVGFEImageElement|SVGFEMergeElement|SVGFEMergeNodeElement|SVGFEMorphologyElement|SVGFEOffsetElement|SVGFEPointLightElement|SVGFESpecularLightingElement|SVGFESpotLightElement|SVGFETileElement|SVGFETurbulenceElement|SVGFilterElement|SVGFontElement|SVGFontFaceElement|SVGFontFaceFormatElement|SVGFontFaceNameElement|SVGFontFaceSrcElement|SVGFontFaceUriElement|SVGForeignObjectElement|SVGGElement|SVGGlyphElement|SVGGlyphRefElement|SVGGradientElement|SVGLinearGradientElement|SVGRadialGradientElement|SVGHKernElement|SVGImageElement|SVGLineElement|SVGMPathElement|SVGMarkerElement|SVGMaskElement|SVGMetadataElement|SVGMissingGlyphElement|SVGPathElement|SVGPatternElement|SVGPolygonElement|SVGPolylineElement|SVGRectElement|SVGSVGElement|SVGScriptElement|SVGStopElement|SVGStyleElement|SVGSwitchElement|SVGSymbolElement|SVGTextContentElement|SVGTextPathElement|SVGTextPositioningElement|SVGAltGlyphElement|SVGTRefElement|SVGTSpanElement|SVGTextElement|SVGTitleElement|SVGUseElement|SVGVKernElement|SVGViewElement';
  var v2/*HTMLDocument*/ = 'HTMLDocument|SVGDocument';
  var v3/*DocumentFragment*/ = 'DocumentFragment|ShadowRoot';
  var v4/*Element*/ = [v0/*HTMLMediaElement*/,v1/*SVGElement*/,'Element|HTMLElement|HTMLAnchorElement|HTMLAppletElement|HTMLAreaElement|HTMLBRElement|HTMLBaseElement|HTMLBaseFontElement|HTMLBodyElement|HTMLButtonElement|HTMLCanvasElement|HTMLContentElement|HTMLDListElement|HTMLDetailsElement|HTMLDirectoryElement|HTMLDivElement|HTMLEmbedElement|HTMLFieldSetElement|HTMLFontElement|HTMLFormElement|HTMLFrameElement|HTMLFrameSetElement|HTMLHRElement|HTMLHeadElement|HTMLHeadingElement|HTMLHtmlElement|HTMLIFrameElement|HTMLImageElement|HTMLInputElement|HTMLKeygenElement|HTMLLIElement|HTMLLabelElement|HTMLLegendElement|HTMLLinkElement|HTMLMapElement|HTMLMarqueeElement|HTMLMenuElement|HTMLMetaElement|HTMLMeterElement|HTMLModElement|HTMLOListElement|HTMLObjectElement|HTMLOptGroupElement|HTMLOptionElement|HTMLOutputElement|HTMLParagraphElement|HTMLParamElement|HTMLPreElement|HTMLProgressElement|HTMLQuoteElement|HTMLScriptElement|HTMLSelectElement|HTMLShadowElement|HTMLSourceElement|HTMLSpanElement|HTMLStyleElement|HTMLTableCaptionElement|HTMLTableCellElement|HTMLTableColElement|HTMLTableElement|HTMLTableRowElement|HTMLTableSectionElement|HTMLTextAreaElement|HTMLTitleElement|HTMLTrackElement|HTMLUListElement|HTMLUnknownElement'].join('|');
  var table = [
    // [dynamic-dispatch-tag, tags of classes implementing dynamic-dispatch-tag]
    ['AudioParam', 'AudioParam|AudioGain']
    , ['DOMTokenList', 'DOMTokenList|DOMSettableTokenList']
    , ['HTMLDocument', v2/*HTMLDocument*/]
    , ['DocumentFragment', v3/*DocumentFragment*/]
    , ['HTMLMediaElement', v0/*HTMLMediaElement*/]
    , ['SVGElement', v1/*SVGElement*/]
    , ['Element', v4/*Element*/]
    , ['EntrySync', 'EntrySync|DirectoryEntrySync|FileEntrySync']
    , ['HTMLCollection', 'HTMLCollection|HTMLOptionsCollection']
    , ['Node', [v2/*HTMLDocument*/,v3/*DocumentFragment*/,v4/*Element*/,'Node|Attr|CharacterData|Comment|Text|CDATASection|DocumentType|Entity|EntityReference|Notation|ProcessingInstruction'].join('|')]
    , ['Uint8Array', 'Uint8Array|Uint8ClampedArray']
  ];
  $dynamicSetMetadata(table);
})();
//  ********** Globals **************
function $static_init(){
}
var const$0000 = Object.create(_DeletedKeySentinel.prototype, {});
var const$0001 = Object.create(NoMoreElementsException.prototype, {});
var const$0002 = new JSSyntaxRegExp("^#[_a-zA-Z]\\w*$");
var const$0003 = Object.create(EmptyQueueException.prototype, {});
var const$0004 = Object.create(UnsupportedOperationException.prototype, {_message: {"value": "", writeable: false}});
var $globals = {};
$static_init();
if (typeof window != 'undefined' && typeof document != 'undefined' &&
    window.addEventListener && document.readyState == 'loading') {
  window.addEventListener('DOMContentLoaded', function(e) {
    main();
  });
} else {
  main();
}

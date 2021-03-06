// tokens.js
// 2010-01-14

// (c) 2006 Douglas Crockford

// Produce an array of simple token objects from a string.
// A simple token object contains these members:
//      type: 'name', 'string', 'number', 'operator'
//      value: string or number value of the token
//      from: index of first character of the token
//      to: index of the last character + 1

// Comments of the // type are ignored.

// Operators are by default single characters. Multicharacter
// operators can be made by supplying a string of prefix and
// suffix characters.
// characters. For example,
//      '<>+-&', '=>&:'
// will match any of these:
//      <=  >>  >>>  <>  >=  +: -: &: &&: &&

this.setup = function() {

    // Make a new object that inherits members from an existing object.

    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }
    
    // Transform a token object into an exception object and throw it.
    
//    Object.prototype.error = function (message, t) {
//        t = t || this;
//        t.name = "SyntaxError";
//        t.message = message;
//        debugger;
//        throw t;
//    };

    String.prototype.tokens = function (prefix, suffix) {
        var operators = [
            "+",
            "-",
            "*",
            "/",
            "%",
            "<",
            ">",
            "=",
            "==",
            "===",
            "!",
            "!=",
            "!==",
            "<=",
            ">=",
            ".",
            "&",
            "&&",
            "|",
            "||",
            "^",
            ">>",
            ">>>",
            "<<",
            "++",
            "--",
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
            "<<=",
            ">>=",
            ">>>=",
            "&=",
            "|=",
            "^=",
            "~",
            "?",
            ":"
        ];
        var operatorCache = { };
        var c;                      // The current character.
        var from;                   // The index of the start of the token.
        var i = 0;                  // The index of the current character.
        var l = 1;                  // The current line number
        var origI = -1;             // i before tried to be regexp
        var length = this.length;
        var n;                      // The number value.
        var q;                      // The quote character.
        var str;                    // The string value.
        var isHex;                  // Keeps track of whether a number is hex
    
        var result = [];            // An array to hold the results.
        
        var that = this;
    
        var lastNonWhite = function() {
            var j = i - 1;
            while (" \t\n\r".indexOf(that.charAt(j))>=0 && j>=0) {
                j--;
            }
            return that.charAt(j);
        };
        
        var lastToken = function() {
            return result[result.length-1];
        };
        
        var isOperator = function(op) {
            if (typeof operatorCache[op]!=='undefined') {
                return operatorCache[op];
            }
            for (var oi=0; oi<operators.length; oi++) {
                if (operators[oi]===op) {
                    operatorCache[op]=true;
                    //console.log("is " + op);
                    return true;
                }
            }
            operatorCache[op]=false;
            //console.log("is not " + op);
            return false;
        };
    
        var make = function (type, value) {
    
    // Make a token object.
    
            return {
                type: type,
                value: value,
                from: from,
                to: i,
                line: l,
                error: function (message, t) {
                    t = t || this;
                    t.name = "SyntaxError";
                    t.message = message;
                    throw t;
                }
            };
        };
    
    // Begin tokenization. If the source string is empty, return nothing.
    
        if (!this) {
            return;
        }
    
    // If prefix and suffix strings are not provided, supply defaults.
    
        if (typeof prefix !== 'string') {
            prefix = '<>+-&';
        }
        if (typeof suffix !== 'string') {
            suffix = '=>&:';
        }
    
    
    // Loop through this text, one character at a time.
    
        c = this.charAt(i);
        while (c && i < this.length) {
            //console.log(i);
            from = i;
    
    // Ignore whitespace.
    
            if (c <= ' ') {
                i += 1;
                if (c==='\n') {
                    l++;
                }
                c = this.charAt(i);
    
    // name.
    
            } else if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c==="_" || c==="$") {
                str = c;
                i += 1;
                for (;;) {
                    c = this.charAt(i);
                    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
                            (c >= '0' && c <= '9') || c === '_' || c==="$") {
                        str += c;
                        i += 1;
                    } else {
                        break;
                    }
                }
                result.push(make('name', str));
    
    // number.
    
    // A number can start with a decimal point. It may start with a digit,
    // possibly '0'.
    
            } else if ((c >= '0' && c <= '9') || (c==="." && this.charAt(i+1)>='0' && this.charAt(i+1)<='9')) {
                isHex = false;
                str = c;
                origI = i;
                i += 1;
    
    // Look for more digits.
    
                for (;;) {
                    c = this.charAt(i);
                    if (c==='x' && i-origI===1) {
                        //console.log("isHex");
                        isHex = true;
                    } else if (c < '0' || c > '9') {
                        if (!isHex || c.toLowerCase()<'a' || c.toLowerCase()>'f') {
                            break;
                        }
                    }
                    i += 1;
                    str += c;
                }
    
    // Look for a decimal fraction part.
    
                if (c === '.') {
                    i += 1;
                    str += c;
                    for (;;) {
                        c = this.charAt(i);
                        if (c < '0' || c > '9') {
                            break;
                        }
                        i += 1;
                        str += c;
                    }
                }
    
    // Look for an exponent part.
    
                if (c === 'e' || c === 'E') {
                    i += 1;
                    str += c;
                    c = this.charAt(i);
                    if (c === '-' || c === '+') {
                        i += 1;
                        str += c;
                    }
                    if (c < '0' || c > '9') {
                        make('number', str).error("Bad exponent");
                    }
                    do {
                        i += 1;
                        str += c;
                        c = this.charAt(i);
                    } while (c >= '0' && c <= '9');
                }
    
    // Make sure the next character is not a letter.
    
                if (c >= 'a' && c <= 'z') {
                    str += c;
                    i += 1;
                    make('number', str).error("Bad number");
                }
    
    // Convert the string value to a number. If it is finite, then it is a good
    // token.
    
                n = +str;
                if (isFinite(n)) {
                    result.push(make('number', n));
                } else {
                    make('number', str).error("Bad number");
                }
    
    // string
    
            } else if (c === '\'' || c === '"') {
                str = '';
                q = c;
                i += 1;
                for (;;) {
                    c = this.charAt(i);
                    if (c < ' ') {
                        make('string', str).error(c === '\n' || c === '\r' || c === '' ?
                            "Unterminated string." :
                            "Control character in string.", make('', str));
                    }
    
    // Look for the closing quote.
    
                    if (c === q) {
                        break;
                    }
    
    // Look for escapement.
    
                    if (c === '\\') {
                        i += 1;
                        if (i >= length) {
                            make('string', str).error("Unterminated string");
                        }
                        c = this.charAt(i);
                        switch (c) {
                        case 'b':
                            c = '\b';
                            break;
                        case 'f':
                            c = '\f';
                            break;
                        case 'n':
                            c = '\n';
                            break;
                        case 'r':
                            c = '\r';
                            break;
                        case 't':
                            c = '\t';
                            break;
                        case 'u':
                            if (i >= length) {
                                make('string', str).error("Unterminated string");
                            }
                            c = parseInt(this.substr(i + 1, 4), 16);
                            if (!isFinite(c) || c < 0) {
                                make('string', str).error("Unterminated string");
                            }
                            c = String.fromCharCode(c);
                            i += 4;
                            break;
                        }
                    }
                    str += c;
                    i += 1;
                }
                i += 1;
                result.push(make('string', str));
                c = this.charAt(i);
    
    // regular expression literal
    
            } else if (i>origI && c === '/' && "/*".indexOf(this.charAt(i+1))<0 && ("(=[!:;&|*+-%".indexOf(lastNonWhite())>=0 || lastToken().value==="return")) {
                var ops = '';
                origI = i;
                str = '';
                i += 1;
                for (;;) {
                    c = this.charAt(i);
                    if ("\n\r".indexOf(c)>=0) {
                        i = origI;
                        c = '/';
                        break;
                        //make('string', str).error("Invalid regular expression");
                    }
                    
        // look for ending /
                    var unescstr = str.replace(/\\\\/g, "@");
                    //console.log("/" + unescstr + "/");
                    if (c === "/" && unescstr.charAt(unescstr.length-1)!=="\\" ) {
                        break;
                    }
                    str = str + c;
                    i += 1;
                }
                
        // look for options
                
                if (i>origI) {
                    i+=1;
                    c = this.charAt(i);
                    while ("gim".indexOf(c)>=0) {
                        ops = ops + c;
                        i+=1;
                        c = this.charAt(i);
                    }
                    
                    result.push(make('regexp', '/' + str + '/' + ops));
                }
    // comment.
    
            } else if (c === '/' && this.charAt(i + 1) === '/') {
                str = c;
                i += 1;
                for (;;) {
                    c = this.charAt(i);
                    if (c === '\n' || c === '\r' || c === '') {
                        break;
                    }
                    str += c;
                    i += 1;
                }
                
                result.push(make('comment', str));
    
    //  multi-line comment
    
            } else if (c === '/' && this.charAt(i + 1) === '*') {
                str = c;
                i += 1;
                for (;;) {
                    c = this.charAt(i);
                    if (c === '' || (c === '*' && this.charAt(i + 1) === '/')) {
                        i += 2
                        c = this.charAt(i);
                        break;
                    }
                    if (c==='\n') {
                        l++;
                    }
                    str += c;
                    i += 1;
                }
                
                result.push(make('comment', str));
    
    // combining
    
            /*} else if (prefix.indexOf(c) >= 0) {
                str = c;
                i += 1;
                while (i < length) {
                    c = this.charAt(i);
                    if (suffix.indexOf(c) < 0 || 
                        (str==='!' && c!=='=') || 
                        (c==='-' && str!=='-') || 
                        (c==='+' && str!=='+')) {
                            break;
                    }
                    str += c;
                    i += 1;
                }
                result.push(make('operator', str));
    
    // single-character operator
    
            } else {
                i += 1;
                result.push(make('operator', c));
                c = this.charAt(i);
            }*/
            
            } else if (isOperator(c)) {
                str = c;
                i += 1;
                while (i<length) {
                    c = this.charAt(i);
                    if (!isOperator(str+c)) {
                        break;
                    }
                    str += c;
                    i += 1;
                }
                result.push(make('operator', str));
            
    // single-character operator
    
            } else {
                i += 1;
                result.push(make('operator', c));
                c = this.charAt(i);
            }
        }
        return result;
    };

};
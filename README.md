# Sema – Live Coding Language Design Playground #

Sema is a playground where you can rapid prototype mini-languages for live coding that integrate signal synthesis, machine learning and machine listening. 

Sema provides an online integrated environment that implements support for designing both abstract high-level languages and more powerful low-level languages.

Sema implements a set of core design principles:

* Integrated signal engine — There is no conceptual split between the language and signal engine. Everything is a signal.

* Single sample signal processing – Per-sample sound processing including techniques that use feedback loops, such as physical modelling, reverberation and IIR filtering.

* Sample rate transduction — It is simpler to do signal processing with one principal sample rate, the audio rate. Different sample rate requirements of dependent objects can be resolved by upsampling and downsampling, using a transducer. The transducer concept enables us to accommodate a variety of processes with varying sample rates (video, spectral rate, sensors, ML model inference) within a single engine.

* Minimal abstractions — There are no high-level abstractions such as buses, synths, nodes, servers, or any language scaffolding in our signal engine. Such abstractions sit within the end-user language design space.

## Dependencies

Sema requires the following dependencies to be installed:

 - [Chrome browser](https://www.google.com/chrome/) 
 - Node.js version 8.9 or higher
 - [NPM cli](https://docs.npmjs.com/cli/npm) OR [Yarn](https://yarnpkg.com/en/)
 

## How to build and run the Sema playground on your machine 

```sh
cd sema
yarn
yarn build
yarn dev
```

## Documentation

[Livecoding with the default grammar](doc/LiveCodingAPI_defaultGrammar.md)

[Sema Intermediate Language](doc/semaIR.md)

[Data storage and loading](doc/Model_loading_storing.md)

[Maximilian DSP Library API](doc/maxi_API_doc.md)

## A one-handed language for controlling multichannel feedback networks

I'm currently developing a new language for controlling multichannel feedback networks. The language is supposed to be used together with a feedback instrument such as the [Halldorophone](http://halldorophone.info) or my own feedback bass. The language is a work in progress, and is based on a few principles:

- It should be possible to touch-type with one hand. The editor should also be modified to allow for one-handed editing, deleting and executing of code.
- It's line-dependant. Functions and variables can be local to the specific line, which represents one channel in the network. Global variables can be used for routing between lines.
- fromJS/toJS functionality is abstracted into a single variable-modifying operator.

```
mp _j, j mp                   // send amplitude data from instrument to JS, get back into variable j, send back as amplitude modulation to instrument
mp J                          // send amplitude of string 2 into global variable J
J mp, pi P                    // and let it control string 3, which controls pitch (shift) of three strings below
P p, U *p, p pi               // Assign to local, invert and send out
P uioöy						  // Map P to a formant filter sequence
K öuio				  		  // Map K to a formant filter sequence



//Slow LFO going into global variable K
(mul 0.1 (sin 1)) +K
//Inverter
1 -U
```

Where the JS window would do something like this:

```js
var functions = {
  f: function(sig) {
  	//do crazy stuff
  	return sig
  }
};

var outputs = {);

input = function(id, sig) {
    id = String.fromCharCode(id);
  	outputs[id] = functions[id]
};

output = function(id) {
  return outputs[id]
};
```


import React, { useState } from 'react';
import './App.css';
import InputFields from './InputFields';

function App() {
  const [input1, setInput1] = useState({
    float: '',
    binary: '',
    hex: '',
    signExponentMantissa: { sign: '', exponent: '', mantissa: '' },
  });
  const [input2, setInput2] = useState({
    float: '',
    binary: '',
    hex: '',
    signExponentMantissa: { sign: '', exponent: '', mantissa: '' },
  });
  const [operation, setOperation] = useState('add');
  const [shiftAmount, setShiftAmount] = useState(0);
  const [selectedInput, setSelectedInput] = useState('input1'); // Tracks which input is selected for shift
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');

  // Conversion functions
  const parseInput = (format, value) => {
    try {
      switch (format) {
        case 'float':
          return parseFloat(value);
        case 'binary':
          return intBitsToFloat(parseInt(value, 2));
        case 'hex':
          return intBitsToFloat(parseInt(value, 16));
        default:
          return NaN;
      }
    } catch {
      return NaN;
    }
  };

  const floatToBinary = (floatVal) => {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, floatVal);
    const intVal = view.getUint32(0);
    return intVal.toString(2).padStart(32, '0');
  };

  const floatToHex = (floatVal) => {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, floatVal);
    const intVal = view.getUint32(0);
    return intVal.toString(16).padStart(8, '0');
  };

  const floatToSignExponentMantissa = (floatVal) => {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, floatVal);
    const intVal = view.getUint32(0);

    const sign = (intVal >>> 31) & 0x1;
    const exponent = (intVal >>> 23) & 0xff;
    const mantissa = intVal & 0x7fffff;

    return {
      sign: sign.toString(16),
      exponent: exponent.toString(16).padStart(2, '0'),
      mantissa: mantissa.toString(16).padStart(6, '0'),
    };
  };

  const intBitsToFloat = (intBits) => {
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, intBits);
    return view.getFloat32(0);
  };

  const floatToIntBits = (floatVal) => {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, floatVal);
    return view.getUint32(0);
  };

  // Operation function
  const calculateResult = () => {
    let res;

    if (operation === 'leftShift' || operation === 'rightShift') {
      const inputToShift =
        selectedInput === 'input1' ? parseFloat(input1.float) : parseFloat(input2.float);
      const binary = floatToIntBits(inputToShift);

      if (operation === 'leftShift') {
        res = intBitsToFloat(binary << shiftAmount);
      } else if (operation === 'rightShift') {
        res = intBitsToFloat(binary >>> shiftAmount);
      }
    } else {
      const num1 = parseFloat(input1.float);
      const num2 = parseFloat(input2.float);

      switch (operation) {
        case 'add':
          res = num1 + num2;
          break;
        case 'subtract':
          res = num1 - num2;
          break;
        case 'multiply':
          res = num1 * num2;
          break;
        case 'xor':
          res = intBitsToFloat(floatToIntBits(num1) ^ floatToIntBits(num2));
          break;
        case 'or':
          res = intBitsToFloat(floatToIntBits(num1) | floatToIntBits(num2));
          break;
        case 'and':
          res = intBitsToFloat(floatToIntBits(num1) & floatToIntBits(num2));
          break;
        default:
          res = NaN;
      }
    }

    if (isNaN(res)) {
      setResult(null);
      setStatus('Result is NaN');
      return;
    }

    setResult({
      float: res.toString(),
      binary: floatToBinary(res),
      hex: floatToHex(res),
      signExponentMantissa: floatToSignExponentMantissa(res),
    });
    setStatus(determineStatus(res));
  };

  const determineStatus = (res) => {
    if (Object.is(res, NaN)) {
      return 'NaN (Not a Number)';
    } else if (res === 0) {
      return 'Zero';
    } else if (res === Infinity) {
      return '+Infinity';
    } else if (res === -Infinity) {
      return '-Infinity';
    } else {
      // Check if normalized or denormalized
      const view = new DataView(new ArrayBuffer(4));
      view.setFloat32(0, res);
      const intVal = view.getUint32(0);

      const exponent = (intVal >>> 23) & 0xff;

      if (exponent === 0) {
        return 'Legal Float-Denormalized ';
      } else {
        return 'Legal Float';
      }
    }
  };

  const clear = () => {
    setInput1({
      float: '',
      binary: '',
      hex: '',
      signExponentMantissa: { sign: '', exponent: '', mantissa: '' },
    });
    setInput2({
      float: '',
      binary: '',
      hex: '',
      signExponentMantissa: { sign: '', exponent: '', mantissa: '' },
    });
    setOperation('add'); // Reset operation to default
    setShiftAmount(0); // Reset shift amount
    setSelectedInput('input1'); // Reset selected input
    setResult(null); // Clear result
    setStatus(''); // Clear status
  };
  

  return (
    <div className="App">
      <h1>Floating Point Calculator</h1>
      <div className="inputs">
        {operation !== 'leftShift' && operation !== 'rightShift' && (
          <>
            <div>
              <h2>Input 1</h2>
              <InputFields
                input={input1}
                setInput={setInput1}
                parseInput={parseInput}
                floatToBinary={floatToBinary}
                floatToHex={floatToHex}
                floatToSignExponentMantissa={floatToSignExponentMantissa}
                intBitsToFloat={intBitsToFloat}
              />
            </div>
            <div>
              <h2>Input 2</h2>
              <InputFields
                input={input2}
                setInput={setInput2}
                parseInput={parseInput}
                floatToBinary={floatToBinary}
                floatToHex={floatToHex}
                floatToSignExponentMantissa={floatToSignExponentMantissa}
                intBitsToFloat={intBitsToFloat}
              />
            </div>
          </>
        )}
        {operation === 'leftShift' || operation === 'rightShift' ? (
          <div>
            <h2>Select Input</h2>
            <div className="input-toggle">
              <button
                className={selectedInput === 'input1' ? 'selected' : ''}
                onClick={() => setSelectedInput('input1')}
              >
                Input 1
              </button>
              <button
                className={selectedInput === 'input2' ? 'selected' : ''}
                onClick={() => setSelectedInput('input2')}
              >
                Input 2
              </button>
            </div>
            <div>
              {selectedInput === 'input1' && (
                <InputFields
                  input={input1}
                  setInput={setInput1}
                  parseInput={parseInput}
                  floatToBinary={floatToBinary}
                  floatToHex={floatToHex}
                  floatToSignExponentMantissa={floatToSignExponentMantissa}
                  intBitsToFloat={intBitsToFloat}
                />
              )}
              {selectedInput === 'input2' && (
                <InputFields
                  input={input2}
                  setInput={setInput2}
                  parseInput={parseInput}
                  floatToBinary={floatToBinary}
                  floatToHex={floatToHex}
                  floatToSignExponentMantissa={floatToSignExponentMantissa}
                  intBitsToFloat={intBitsToFloat}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
      <div className="operation">
        <h2>Select Operation</h2>
        <select value={operation} onChange={(e) => setOperation(e.target.value)}>
          <option value="add">Addition (+)</option>
          <option value="subtract">Subtraction (-)</option>
          <option value="multiply">Multiplication (*)</option>
          <option value="xor">Bitwise XOR (^)</option>
          <option value="or">Bitwise OR (|)</option>
          <option value="and">Bitwise AND (&)</option>
          <option value="leftShift">Left Shift (&lt;&lt;)</option>
          <option value="rightShift">Right Shift (&gt;&gt;)</option>
        </select>
        {(operation === 'leftShift' || operation === 'rightShift') && (
          <div className="shift-amount">
            <label htmlFor="shiftAmount">Shift Amount:</label>
            <input
              type="number"
              id="shiftAmount"
              min="0"
              max="31"
              value={shiftAmount}
              onChange={(e) => setShiftAmount(parseInt(e.target.value) || 0)}
            />
          </div>
        )}
        <button onClick={calculateResult}>Calculate</button>
        <button onClick={clear}>Clear</button>
      </div>
      {result !== null && (
        <div className="result">
          <h2>Result</h2>
          <p>Float: {result?.float}</p>
          <div>
            <h3>Binary Representation:</h3>
            <div className="bits-container">
              {/* Sign */}
              <span className="bit bit-sign">{result?.binary[0]}</span>

              {/* Exponent */}
              {result?.binary.slice(1, 9).split('').map((bit, index) => (
                <span key={index} className="bit bit-exponent">
                  {bit}
                </span>
              ))}

              {/* Mantissa */}
              {result?.binary.slice(9).split('').map((bit, index) => (
                <span key={index} className="bit bit-mantissa">
                  {bit}
                </span>
              ))}
            </div>
          </div>
          <p>Hexadecimal: {result?.hex}</p>
          <p>Sign: {result?.signExponentMantissa?.sign}</p>
          <p>Exponent: {result?.signExponentMantissa?.exponent}</p>
          <p>Mantissa: {result?.signExponentMantissa?.mantissa}</p>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
}

export default App;

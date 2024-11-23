// InputFields.js
import React, { useState } from 'react';

function InputFields({
  input,
  setInput,
  parseInput,
  floatToBinary,
  floatToHex,
  floatToSignExponentMantissa,
  intBitsToFloat,
}) {
  const [error, setError] = useState('');

  const semToFloat = (signStr, exponentStr, mantissaStr) => {
    try {
      const sign = parseInt(signStr, 16);
      const exponent = parseInt(exponentStr, 16);
      const mantissa = parseInt(mantissaStr, 16);

      if (
        isNaN(sign) ||
        isNaN(exponent) ||
        isNaN(mantissa) ||
        sign < 0 ||
        sign > 1 ||
        exponent < 0 ||
        exponent > 0xff ||
        mantissa < 0 ||
        mantissa > 0x7fffff
      ) {
        setError('Invalid Sign, Exponent, or Mantissa values');
        return NaN;
      }

      const intVal = (sign << 31) | (exponent << 23) | mantissa;
      return intBitsToFloat(intVal);
    } catch {
      setError('Error converting SEM to float');
      return NaN;
    }
  };

  const handleChange = (format, value) => {
    if (['sign', 'exponent', 'mantissa'].includes(format)) {
      setInput((prevInput) => {
        const updatedSEM = {
          ...prevInput.signExponentMantissa,
          [format]: value,
        };

        const { sign, exponent, mantissa } = updatedSEM;

        if (sign === '' || exponent === '' || mantissa === '') {
          return {
            ...prevInput,
            signExponentMantissa: updatedSEM,
          };
        }

        const floatVal = semToFloat(sign, exponent, mantissa);

        if (isNaN(floatVal)) {
          return {
            ...prevInput,
            signExponentMantissa: updatedSEM,
          };
        }

        setError(''); // Clear any previous error

        const binaryVal = floatToBinary(floatVal);
        const hexVal = floatToHex(floatVal);

        return {
          float: floatVal.toString(),
          binary: binaryVal,
          hex: hexVal,
          signExponentMantissa: updatedSEM,
        };
      });
    } else {
      // Existing code for float, binary, hex inputs
      setInput((prevInput) => ({
        ...prevInput,
        [format]: value,
      }));

      if (value.trim() === '') {
        return;
      }

      if (format === 'float') {
        if (/^-?\d*\.?\d*$/.test(value)) {
          const floatVal = parseFloat(value);
          if (!isNaN(floatVal)) {
            setError(''); // Clear error
            const binaryVal = floatToBinary(floatVal);
            const hexVal = floatToHex(floatVal);
            const signExponentMantissaVal = floatToSignExponentMantissa(floatVal);

            setInput({
              float: value,
              binary: binaryVal,
              hex: hexVal,
              signExponentMantissa: signExponentMantissaVal,
            });
          }
        }
      } else if (format === 'binary' || format === 'hex') {
        const floatVal = parseInput(format, value);
        if (isNaN(floatVal)) {
          setError(`Invalid ${format} value`);
          return;
        }

        setError(''); // Clear error
        const binaryVal = floatToBinary(floatVal);
        const hexVal = floatToHex(floatVal);
        const signExponentMantissaVal = floatToSignExponentMantissa(floatVal);

        setInput({
          float: floatVal.toString(),
          binary: binaryVal,
          hex: hexVal,
          signExponentMantissa: signExponentMantissaVal,
        });
      }
    }
  };

  return (
    <div className="input-fields">
      <div>
        <label>Float:</label>
        <input
          type="text"
          value={input.float}
          onChange={(e) => handleChange('float', e.target.value)}
          placeholder="e.g., -3.14"
        />
      </div>
      <div>
        <label>Binary:</label>
        <input
          type="text"
          value={input.binary}
          onChange={(e) => handleChange('binary', e.target.value)}
          placeholder="32-bit binary"
        />
      </div>
      <div>
        <label>Hexadecimal:</label>
        <input
          type="text"
          value={input.hex}
          onChange={(e) => handleChange('hex', e.target.value)}
          placeholder="e.g., 40490fdb"
        />
      </div>
      <div>
        <label>Sign:</label>
        <input
          type="text"
          value={input.signExponentMantissa.sign}
          onChange={(e) => handleChange('sign', e.target.value)}
          placeholder="0 or 1"
        />
      </div>
      <div>
        <label>Exponent:</label>
        <input
          type="text"
          value={input.signExponentMantissa.exponent}
          onChange={(e) => handleChange('exponent', e.target.value)}
          placeholder="Hexadecimal, e.g., 80"
        />
      </div>
      <div>
        <label>Mantissa:</label>
        <input
          type="text"
          value={input.signExponentMantissa.mantissa}
          onChange={(e) => handleChange('mantissa', e.target.value)}
          placeholder="Hexadecimal, e.g., 000000"
        />
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default InputFields;

import i18n from '@/i18n';
const {t, tc} = i18n.global;

export const contentValueRule = (message: string) => {
  if (!message) {
    message = t('form.required');
  }
  return (val: string | number) => {
    if (val === 0) return true;
    return !!val || message;
  };
};

const pathNameReservedCharactersRegExp = /[/|\\?":<>!*%]/;

export const contentPathNameReservedCharactersRule = (message: string) => {
  return (min: string) => {
    const check = pathNameReservedCharactersRegExp.test(min);
    if (min && check) return message;
    return true;
  };
};

const onlyLowercaseAndNumberWithMinusRegExp = /^[a-z]([a-z0-9-]){0,}[a-z0-9]$/;

export const contentFirstAlphabetRule = () => {
  return (val: string) => {
    const check = val && !ruleFirstAlphabet(val);
    if (check) return t('tips.name.first.char.lowercase');
    return true;
  };
};

export const contentOnlyLowercaseAndNumberWithMinusRule = (
  message: string = '',
) => {
  if (!message) {
    message = t('tips.name.letterNumDash.and.startEndLetter');
  }
  return (val: string) => {
    const check = onlyLowercaseAndNumberWithMinusRegExp.test(val);
    if (val && !check) return message;
    return true;
  };
};

export const bucketMaxLengthRule = (message: string) => {
  return (val: string) => {
    const exceed = val && (val.length > 63 || val.length < 3);
    if (exceed) return message;
    return true;
  };
};

export const ruleFirstAlphabet = (input: string) => {
  return /^[a-z][a-z0-9]*$/.test(input.slice(0, 1));
};

export const ruleLowercaseNumberWithMinus = (input: string) => {
  return /^[a-z0-9]([a-z0-9-]{0,}[a-z0-9])$/.test(input);
};

export const ruleLowercaseNumber = (input: string) => {
  return /^[a-z0-9][a-z0-9]*$/.test(input);
};

export const ruleBucketName = (input: string) => {
  return input ? input.length <= 63 && input.length >= 3 : false;
};

export const checkRules = (rules, value: string) => {
  const errorRule = rules.find((rule) => rule(value) !== true);
  if (errorRule) {
    return errorRule(value);
  } else {
    return true;
  }
};

export const emailRule = (value: string) => {
  // prettier-ignore
  const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return pattern.test(value) || tc('form.error.email');
};

export const emailRuleAllowEmpty = (value: string) => {
  if (!value) return true;
  return emailRule(value);
};

export const atLeastOne = {
  upperCaseEngLetter: (input: string) => {
    const regex = /(?=.*[A-Z])/;
    if (regex.test(input)) {
      return true;
    } else {
      return t('form.error.atLeastOne.upperCaseEngLetter');
    }
  },
  lowerCaseEngLetter: (input: string) => {
    const regex = /(?=.*[a-z])/;
    if (regex.test(input)) {
      return true;
    } else {
      return t('form.error.atLeastOne.lowerCaseEngLetter');
    }
  },
  digit: (input: string) => {
    const regex = /(?=.*[0-9])/;
    if (regex.test(input)) {
      return true;
    } else {
      return t('form.error.atLeastOne.digit');
    }
  },
  specialCharacter: (input: string) => {
    const regex = /(?=.*[\W_])/;
    if (regex.test(input)) {
      return true;
    } else {
      return t('form.error.atLeastOne.special.character');
    }
  },
};

export const checkPwdLength = (input: string) => {
  if (input && input.length <= 72 && input.length >= 8) {
    return true;
  } else {
    return t('form.error.pwd.length');
  }
};

export const integerRegexRule = () => {
  const intRegex = /^(-?[1-9]+[0-9]*|0)$/;
  const errMsg = t('form.error.integer');

  return (input: string) => {
    const check = intRegex.test(input);
    if (input && !check) return errMsg;
    return true;
  };
};

export const minValueRule = (message: string, min: number) => {
  return (val: string) => {
    if (val && (parseInt(val) < min || !Number.isInteger(parseFloat(val)))) {
      return message;
    }
    return true;
  };
};

export const maxValueRule = (message: string, max: number | string) => {
  return (val: string) => {
    const value = parseInt(val);
    if (value > Number(max)) {
      return message;
    }
    return true;
  };
};

export const integerRule = () => {
  return (input: string) => {
    if (input && !Number.isInteger(parseFloat(input)))
      return t('form.error.integer');
    return true;
  };
};

export const minValueRuleWithException = (
  message: string,
  min: number,
  exceptionAry: any[],
) => {
  return (val: string) => {
    const value = parseFloat(val);
    if (
      value < min ||
      !Number.isInteger(parseFloat(val)) ||
      (exceptionAry && exceptionAry.length > 0 && exceptionAry.includes(value))
    ) {
      return message;
    }
    return true;
  };
};

export const minNumberRule = (message: string, min: number | string) => {
  return (val: number | string) => {
    const value = Number(val);
    if (value <= Number(min)) {
      return message;
    }
    return true;
  };
};

export const maxNumberRule = (message: string, max: number | string) => {
  return (val: number | string) => {
    const value = Number(val);
    if (value >= Number(max)) {
      return message;
    }
    return true;
  };
};

import i18n from '@/i18n';
import {UUIDRegex} from '@/constants/Constants';
import {isEmptyObject} from '@/utils/utils';

const {t} = i18n.global;
const onlyLowercaseAndNumberRegExp = /^[a-z][a-z0-9]*$/;
const iServiceSysCodeNameRuleRegExp = /^TCI[0-9]{6}$/;

const ruleOnlyLowercaseAndNumber = (message?: string) => {
  return (input: string) => {
    const check = onlyLowercaseAndNumberRegExp.test(input);
    if (input && !check) {
      return message ?? t('Tips.Account.Letter.Number.Only');
    }
    return true;
  };
};

const ruleRequired = (message?: string) => {
  return (val: string) => {
    return (!!val || message) ?? t('form.required');
  };
};

const ruleComboboxRequired = (message?: string) => {
  return (val: string[]) => {
    return (val.length > 0 || message) ?? t('form.required');
  };
};

const ruleComboboxObjectRequired = (message?: string) => {
  return (val: any) => {
    return ((!!val && !isEmptyObject(val)) || message) ?? t('form.required');
  };
};

const ruleIServiceProjectSysCodeName = () => {
  return (input: string) => {
    const check = iServiceSysCodeNameRuleRegExp.test(input);
    if (!check) {
      return t('tips.name.iservice.codename');
    }
    return true;
  };
};

const ruleUuidFormatter = () => {
  return (input: string) => {
    const check = UUIDRegex.test(input);
    if (!check) {
      return t('form.error.format');
    }
    return true;
  };
};

const rulePassword = () => {
  return [
    atLeastOne.upperCase,
    atLeastOne.lowerCase,
    atLeastOne.digit,
    atLeastOne.special,
    checkPwdLength,
  ];
};

const firstAlphabet = (input: string) => {
  return (
    onlyLowercaseAndNumberRegExp.test(input.slice(0, 1)) ||
    t('tips.name.first.char.lowercase')
  );
};

const lowercaseNumber = (input: string) => {
  return (
    onlyLowercaseAndNumberRegExp.test(input) ||
    t('Tips.Account.Letter.Number.Only')
  );
};

const atLeastOne = {
  upperCase: (input: string) => {
    const regex = /(?=.*[A-Z])/;
    return regex.test(input) || t('form.error.atLeastOne.upperCaseEngLetter');
  },
  lowerCase: (input: string) => {
    const regex = /(?=.*[a-z])/;
    return regex.test(input) || t('form.error.atLeastOne.lowerCaseEngLetter');
  },
  digit: (input: string) => {
    const regex = /(?=.*[0-9])/;
    return regex.test(input) || t('form.error.atLeastOne.digit');
  },
  special: (input: string) => {
    const regex = /(?=.*[\W_])/;
    return regex.test(input) || t('form.error.atLeastOne.special.character');
  },
};

const checkPwdLength = (input: string) => {
  return (
    (input.length <= 72 && input.length >= 8) || t('form.error.pwd.length')
  );
};

const checkNumberRange = ({
  val,
  minVal,
  maxVal,
}: {
  val: number;
  minVal: number;
  maxVal: number;
}) => {
  return (
    (val <= maxVal && val >= minVal) ||
    t('Tips.Number.Range', {min: minVal, max: maxVal})
  );
};

export default {
  ruleOnlyLowercaseAndNumber,
  ruleRequired,
  ruleComboboxRequired,
  ruleComboboxObjectRequired,
  rulePassword,
  ruleIServiceProjectSysCodeName,
  firstAlphabet,
  lowercaseNumber,
  atLeastOne,
  checkPwdLength,
  checkNumberRange,
  ruleUuidFormatter,
};

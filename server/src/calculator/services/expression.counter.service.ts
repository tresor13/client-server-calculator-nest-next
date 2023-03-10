import { Injectable } from '@nestjs/common';
import { OperatorRegExp } from '../configs/types';
import { UNARY_OPERATOR_TYPE, BINARY_OPERATOR_TYPE } from '../configs';
import { operatorEntities as operators } from '../configs';
import { IExpressionCounterService } from '../interfaces/calculator.services.interfaces';

@Injectable()
export class DefaultExpressionCounterService
  implements IExpressionCounterService
{
  countExpression(inputString: string, operator: OperatorRegExp): string {
    const operatorRegEx = operator.regExp;
    const operatorType = operator.type;
    const operandRegEx = '\\d+(?:\\.\\d+)?';

    let regexp = new RegExp(`${operatorRegEx}[(]?\\s*(-?${operandRegEx})[)]?`); //unary operator RegExp

    if (operatorType === BINARY_OPERATOR_TYPE) {
      regexp = new RegExp(
        `(-?${operandRegEx})\\s*${operatorRegEx}\\s*(-?${operandRegEx})`,
      );
    }

    if (!inputString.match(regexp)) {
      return inputString;
    }

    const replaced = inputString.replace(regexp, (inputString) => {
      const resultArr = this.parseExprForMathEntities(inputString, regexp);

      if (operatorType === UNARY_OPERATOR_TYPE) {
        const [operator, num] = resultArr;

        const result = operators[operator].count(Number(num));
        return `${result}`;
      }
      const [left, operator, right] = resultArr;

      const result = operators[operator].count(Number(left), Number(right));

      return `${result}`;
    });

    return this.countExpression(replaced, operator);
  }

  parseExprForMathEntities(expr: string, regexp: RegExp): string[] {
    const result = expr.match(regexp);

    if (!result) return [];

    result.shift();

    return result;
  }
}

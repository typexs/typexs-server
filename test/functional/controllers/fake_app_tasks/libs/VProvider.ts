import {IValueProvider} from '@typexs/base/libs/tasks/decorators/IValueProvider';
import {IPropertyRef} from '@allgemein/schema-api';
import {ExprDesc} from '@allgemein/expressions';

export class VProvider implements IValueProvider<string[]> {
  get(entity?: any, property?: IPropertyRef, hint?: ExprDesc): string[] {
    return ['VP-One1', 'VP-Two2', 'VP-Tree3'];
  }
}

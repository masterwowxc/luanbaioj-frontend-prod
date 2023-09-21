/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderItem } from './OrderItem';
import type { QuestionSubmitViewVO } from './QuestionSubmitViewVO';

export type Page_QuestionSubmitViewVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: Array<OrderItem>;
    pages?: number;
    records?: Array<QuestionSubmitViewVO>;
    searchCount?: boolean;
    size?: number;
    total?: number;
};

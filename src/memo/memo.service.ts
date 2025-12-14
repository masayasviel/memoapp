import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { type DB, InjectDb } from '@/db/db';
import { Memo, memoTagRelation, Tag } from '@/db/schema';

import { CreateMemoDto, UpdateMemoDto } from './memo.zod';

@Injectable()
export class MemoService {
  constructor(@InjectDb() private readonly db: DB) {}

  list(userId: number) {
    return this.db
      .select({
        title: Memo.title,
        createdAt: Memo.createdAt,
        updatedAt: Memo.updatedAt,
      })
      .from(Memo)
      .where(eq(Memo.userId, userId));
  }

  async detail(userId: number, memoId: number) {
    const rows = await this.db
      .select({
        id: Memo.id,
        title: Memo.title,
        content: Memo.content,
        createdAt: Memo.createdAt,
        updatedAt: Memo.updatedAt,
        tag: {
          id: Tag.id,
          name: Tag.name,
          isOfficial: Tag.isOfficial,
        },
      })
      .from(Memo)
      .leftJoin(memoTagRelation, eq(memoTagRelation.memoId, Memo.id))
      .leftJoin(Tag, eq(memoTagRelation.tagId, Tag.id))
      .where(and(eq(Memo.id, memoId), eq(Memo.userId, userId)));

    if (rows.length === 0) {
      throw new NotFoundException();
    }

    type Row = (typeof rows)[number];
    const base = rows[0];
    const tags = rows
      .filter(
        (
          r: Row,
        ): r is Row & {
          tag: { id: number; name: string; isOfficial: boolean };
        } => r.tag?.id != null,
      )
      .map((r) => r.tag);

    return {
      id: base.id,
      title: base.title,
      content: base.content,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
      tags,
    };
  }

  async register(userId: number, createCatDto: CreateMemoDto) {
    const insertMemo = await this.db
      .insert(Memo)
      .values([
        {
          userId,
          title: createCatDto.title,
          content: createCatDto.content,
        },
      ])
      .$returningId();
    if (insertMemo.length !== 1) {
      throw new InternalServerErrorException();
    }
    return this.detail(userId, insertMemo[0].id);
  }

  async edit(userId: number, memoId: number, updateCatDto: UpdateMemoDto) {
    await this.exists(userId, memoId);
    await this.db
      .update(Memo)
      .set({ title: updateCatDto.title, content: updateCatDto.content })
      .where(and(eq(Memo.id, memoId), eq(Memo.userId, userId)));
  }

  async delete_(userId: number, memoId: number) {
    await this.exists(userId, memoId);
    await this.db
      .delete(Memo)
      .where(and(eq(Memo.id, memoId), eq(Memo.userId, userId)));
  }

  private async exists(userId: number, memoId: number) {
    const res = await this.db
      .select()
      .from(Memo)
      .where(and(eq(Memo.id, memoId), eq(Memo.userId, userId)));
    if (res.length === 0) {
      throw new NotFoundException();
    }
    return res[0];
  }
}

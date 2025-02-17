import { Prisma, FollowUser } from '@prisma/client';
import db from '../lib/db';

const userFollowService = {
  async findFollowRelationship(userId: string, followUserId: string): Promise<FollowUser | null> {
    return await db.followUser.findFirst({
      where: {
        fk_following_user_id: userId,
        fk_follower_user_id: followUserId,
      },
    });
  },
  async isFollowed(userId: string, followUserId: string): Promise<boolean> {
    return !!(await this.findFollowRelationship(userId, followUserId));
  },
};

export default userFollowService;

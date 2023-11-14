import Router from '@koa/router';
import externalInterationService from '../../../../services/externalIntegrationService';
import userService from '../../../../services/userService';
import postService from '../../../../services/postService';

const codenary = new Router();

codenary.get('/token', async ctx => {
  if (!ctx.request.query.code) {
    ctx.throw(400, { message: 'Missing code' });
  }
  try {
    const token = await externalInterationService.exchangeToken(ctx.request.query.code as string);
    ctx.body = {
      access_token: token,
    };
  } catch (e) {
    ctx.throw(403, { message: 'Invalid code' });
  }
});

codenary.get('/profile', async ctx => {
  if (!ctx.request.query.token) {
    ctx.throw(401);
    return;
  }
  try {
    const decoded = await externalInterationService.decodeIntegrationToken(ctx.request.query.token as string);
    if (!decoded) {
      ctx.throw(401);
      return;
    }
    const user = await userService.getPublicProfileById(decoded.integrated_user_id);
    ctx.body = user;
  } catch (e) {
    ctx.throw(401);
  }
});

codenary.get('/posts', async ctx => {
  const { key, user_id, size, cursor } = ctx.request.query;
  if (key !== process.env.CODENARY_API_KEY) {
    console.log(key, process.env.CODENARY_API_KEY);
    ctx.throw(401);
    return;
  }
  if (!user_id) {
    ctx.throw(400, 'Missing user_id');
    return;
  }

  const isIntegrated = await externalInterationService.checkIntegrated(user_id as string);
  if (!isIntegrated) {
    ctx.throw(403, 'User not integrated');
    return;
  }

  const posts = await postService.findPostsByUserId({
    userId: user_id as string,
    size: size ? parseInt(size as string) : 20,
    cursor: cursor as string,
  });

  ctx.body = posts;
});

export default codenary;

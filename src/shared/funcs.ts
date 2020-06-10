import { IdeaEntity } from 'src/idea/idea.entity';
import { IdeaRO } from 'src/idea/idea.dto';

export function formatIdeaRO(idea: IdeaEntity): IdeaRO {
  console.log(idea);
  return {
    ...idea,
    createdBy: idea.createdBy
      ? idea.createdBy.returnResponseObject(false)
      : null,
    upvotes: idea.upvotes
      ? idea.upvotes.map(item => item.returnResponseObject(false))
      : [],
    downvotes: idea.downvotes
      ? idea.downvotes.map(item => item.returnResponseObject(false))
      : [],
    comments: idea.comments
      ? idea.comments.map(item => ({
          ...item,
          createdBy: item.createdBy.returnResponseObject(false),
        }))
      : [],
  };
}


import { vocabularyPacks, type VocabularyPack } from '../../../../lib/data'
import { redirect } from 'next/navigation';
import QuizClientPage from '../../../../components/quiz/QuizClientPage'

export default async function VocabularyQuizPage(props: { params: { packId: string } }) {
  const packId = props.params.packId;
  const pack = vocabularyPacks.find(p => p.id === packId);

  if (!pack) {
    // If pack is not found, redirect to the main quizzes page.
    redirect('/quizzes');
  }

  // QuizClientPage will handle the case where pack.items might be empty.
  return <QuizClientPage pack={pack} />;
}

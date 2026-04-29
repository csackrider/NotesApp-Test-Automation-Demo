import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import NoteEditorFields from './NoteEditorFields';

const EditNote = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isNoteLoaded, setIsNoteLoaded] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchNote();
  }, []);

  const fetchNote = async () => {
    try {
      const response = await axios.get('http://localhost:3004/notes/' + id);
      setDescription(response.data.description);
      setTitle(response.data.title);
      setIsNoteLoaded(true);
    } catch (error) {
      console.error('Error getting note: ', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put('http://localhost:3004/notes/' + id, { title, description });
      navigate('/');
    } catch (error) {
      console.error('Error editing note: ', error);
    }
  };

  return (
    <div className="container">
      <h2>Edit Note</h2>
      <form onSubmit={handleSubmit}>
        <NoteEditorFields
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          showCharacterCount={isNoteLoaded}
        />
        <button id="submitEdit" type="submit" className="btn btn-success">
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditNote;

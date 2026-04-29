import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ViewNote = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get('http://localhost:3004/notes/' + id);
        setDescription(response.data.description);
        setTitle(response.data.title);
      } catch (error) {
        console.error('Error getting note: ', error);
      }
    };

    fetchPost();
  }, [id]);

  return (
    <div>
      <h2 id="noteTitle">{title}</h2>
      <p id="noteDescription">{description}</p>
    </div>
  );
};
export default ViewNote;

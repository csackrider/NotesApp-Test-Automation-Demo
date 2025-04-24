import {useEffect, useState} from "react";
import axios from 'axios';
import {Link} from "react-router-dom";

const ListNotes = () => {
	const [notes, setNotes] = useState([]);
	useEffect(() => {
		fetchNotes()
	}, []);

	const fetchNotes = async () => {
		try {
			const response = await axios.get('http://localhost:3004/notes');
			setNotes(response.data);
		} catch (error) {
			console.error('Error getting notes: ', error);
		}
	}

	const onDelete = async (id) => {
		try {
			axios.delete(`http://localhost:3004/notes/${id}`)
				.then(() => {
					fetchNotes();
				})
		} catch (e) {
			console.error('Error deleting note: ', e);
		}
	}
	return (
		<div><h2>List of Notes</h2>
			<table id={"notes"}>
				{notes.map((post) => (
					<tr key={post.id}>
						<td id={"notetitle_"+post.id}>
							{post.title}
						</td>
						<td>
							<Link className={'btn btn-success'} id={'view_'+post.id} to={`/view/${post.id}`}>View</Link>
						</td>
						<td>
							<Link className={'btn btn-warning'} id={'edit_'+post.id} to={`/edit/${post.id}`}>Edit</Link>
						</td>
						<td>
							<Link className={'btn btn-danger'}id={'delete_'+post.id} onClick={() => onDelete(post.id)} >Delete</Link>
						</td>
					</tr>
				))}
			</table>
		</div>
	)

}
export default ListNotes;

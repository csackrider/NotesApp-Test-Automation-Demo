import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import AddNote from './components/AddNote';
import ListNotes from './components/ListNotes';
import EditNote from './components/EditNote';
import ViewNote from './components/ViewNote';
function App() {
  return (
     <Router>
       <div className="App">
         <nav className={'topnav'}>
           <ul className="list-unstyled">
             <li>
               <Link id='home' to="/">Home</Link>
             </li>
             <li>
               <Link id='add' to="/add">Add Note</Link>
             </li>
           </ul>
         </nav>

         <Routes>
           <Route path="/" element={<ListNotes/>}/>
           <Route path="edit/:id" element={<EditNote/>}/>
           <Route path="/add" element={<AddNote/>}/>
           <Route path="view/:id" element={<ViewNote/>}/>
         </Routes>

       </div>
     </Router>
  );
}

export default App;

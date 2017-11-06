import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { QueryFn } from 'angularfire2/firestore/interfaces';
import { Observable } from 'rxjs';
import { AuthProvider } from '../auth/auth';
import * as moment from 'moment-timezone';

export interface Note {
  id: string;
  user: string;
  date: Date;
  content: string;
  archived: boolean;
}

@Injectable()
export class FirebaseProvider {

  private notesCollection: AngularFirestoreCollection<Note>;

  constructor(
    public http: Http,
    public angularFireDatabase: AngularFireDatabase,
    public authProvider: AuthProvider,
    public angularFireStore: AngularFirestore
  ) {
    this.notesCollection = angularFireStore.collection<Note>('notes');
  }

  private getNotesByQuery(filterFn: QueryFn): Observable<Note[]> {
    var notesCollection = this.angularFireStore.collection<Note>('notes', filterFn);
    var notes: Observable<Note[]> = notesCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Note;
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    });
    return notes;
  }

  getItems(includeArchived: boolean = false): Observable<Note[]> {
    let userId = this.authProvider.getUser().uid
    return this.getNotesByQuery(
      ref => ref
        .where('user', '==', userId)
        .where('archived', '==', false)
        .orderBy('date', 'desc')
    );
  }

  getSortedItems(): Observable<Note[]> {
    let userId = this.authProvider.getUser().uid
    return this.getNotesByQuery(
      ref => ref
        .where('user', '==', userId)
        .where('archived', '==', false)
        .where('date', ">=", moment().subtract(2, 'hours').format())
        .orderBy('date', 'asc')
    );
  }

  getLimitedItems(): Observable<Note[]> {
    let userId = this.authProvider.getUser().uid
    return this.getNotesByQuery(
      ref => ref
        .where('user', '==', userId)
        .where('archived', '==', false)
        .where('date', ">=", moment().format())
        .orderBy('date', 'asc')
        .limit(2)
    );
  }

  saveItem(id, note) {
    if (note['id']) {
      delete note['id'];
    }
    this.angularFireStore
      .doc<Note>(`notes/${id}`)
      .update(note);
  }

  addItem(note: Note) {
    this.notesCollection.add(note);
  }

  archive(id, note) {
    note['archived'] = true;
    this.saveItem(id, note);
  }

  delete(note) {
    const key = note['id'];
    if(!key) {
      throw new Error('The note id was not found');
    }
    this.angularFireStore
      .doc<Note>(`notes/${note.id}`)
      .delete();
  }

}

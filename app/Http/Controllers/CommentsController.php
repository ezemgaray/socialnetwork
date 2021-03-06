<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Post;
use Auth;

class CommentsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request, $id)
    {
       
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $id)
    {
        if($request->ajax()) {

            $user = auth()->user();
            $comment = new Comment;
            $comment->post_id = $id;
            $comment->user_id = $user->id;
            $comment->content = $request->content;
            $comment->save();

            $post = Post::find($id);
            $post->comments_count++;
            $post->save();

            $post = Comment::where('id',$comment->id)->first()->post;
            $comments = $post->comments;
            $reaction = $post->userReaction;

            $comments = view('includes.comments',compact(['comments']))->render();
            return response()->json(['comments'=>$comments,'post'=>$post]);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function loadPostComments(Request $request, $id)
    {
        $post = Comment::where('post_id',$id)->first()->post;
        $comments = $post->comments;
        $reaction = $post->userReaction;

        if($request->ajax()) {
            $comments = view('includes.comments',compact(['comments']))->render();
            return response()->json(['comments'=>$comments,'post'=>$post]);
        }

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $comment = Comment::find($id);
        $postID = $comment->post_id;
        $comment->delete();

        $post = Post::find($postID);
        $post->comments_count--;
        
        $post->save();

        $post = Comment::where('post_id',$postID)->first()->post;
        $comments = $post->comments;
        $reaction = $post->userReaction;

        if($request->ajax()) {
            $comments = view('includes.comments',compact(['comments']))->render();
            return response()->json(['comments'=>$comments,'post'=>$post]);
        }
    }
}

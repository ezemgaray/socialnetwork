<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Auth::routes();

Route::get('/', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::middleware('auth')->group(function(){
    //SEARCH
    Route::get('/search', [App\Http\Controllers\FollowsController::class, 'showFriends']);
    //USER
    Route::get('/user/{id}', [App\Http\Controllers\UsersController::class, 'show']);
    Route::get('/{username}', [App\Http\Controllers\UsersController::class, 'index']);
    //FOLLOW
    Route::post('/follow', [App\Http\Controllers\FollowsController::class, 'store'])->name('follow');
    Route::delete('/unfollow', [App\Http\Controllers\FollowsController::class, 'destroy'])->name('unfollow');
    //POST
    Route::post('/post/show', [App\Http\Controllers\PostsController::class, 'show']);
    Route::post('/post', [App\Http\Controllers\PostsController::class, 'store']);
    Route::delete('/post/{id}/delete', [App\Http\Controllers\PostsController::class, 'destroy'])->name('delete');
    //REACTION
    Route::post('/reactions/like/{id}', [App\Http\Controllers\ReactionsController::class, 'createLike']);
    Route::delete('/reactions/like/{id}', [App\Http\Controllers\ReactionsController::class, 'destroyLike']);
    Route::post('/reactions/dislike/{id}', [App\Http\Controllers\ReactionsController::class, 'createDislike']);
    Route::delete('/reactions/dislike/{id}', [App\Http\Controllers\ReactionsController::class, 'destroyDislike']);
    //COMMENTS
    Route::get('/comments/post/{id}', [App\Http\Controllers\CommentsController::class, 'loadPostComments']);
    Route::post('/comments/create/{id}', [App\Http\Controllers\CommentsController::class, 'store']);
    Route::delete('/comments/delete/{id}', [App\Http\Controllers\CommentsController::class, 'destroy']);

});